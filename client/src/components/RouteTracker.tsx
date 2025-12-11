import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Square, MapPin, Zap, Activity } from 'lucide-react';
import { watchPosition, clearWatch, type Coordinates } from '@/lib/geolocation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RouteTrackerProps {
  onComplete: (data: {
    coordinates: Array<[number, number]>;
    distance: number;
    duration: number;
  }) => void;
  onCancel: () => void;
}

export function RouteTracker({ onComplete, onCancel }: RouteTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [coordinates, setCoordinates] = useState<Array<[number, number]>>([]);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = L.map(mapContainer.current, {
      center: [40.4168, -3.7038],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (watchIdRef.current) clearWatch(watchIdRef.current);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const calculateDistance = (coords: Array<[number, number]>): number => {
    if (coords.length < 2) return 0;
    
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      const [lat1, lng1] = coords[i - 1];
      const [lat2, lng2] = coords[i];
      
      const R = 6371000;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += R * c;
    }
    
    return total;
  };

  const handleStart = () => {
    setIsTracking(true);
    setIsPaused(false);

    intervalRef.current = window.setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);

    watchIdRef.current = watchPosition(
      (coords: Coordinates) => {
        const newCoords: [number, number] = [coords.lat, coords.lng];
        
        setCoordinates((prev) => {
          const updated = [...prev, newCoords];
          setDistance(calculateDistance(updated));
          
          if (mapRef.current) {
            mapRef.current.setView(newCoords, 17, { animate: true });
            
            if (routeLineRef.current) {
              routeLineRef.current.setLatLngs(updated.map(c => [c[0], c[1]]));
            } else {
              routeLineRef.current = L.polyline(updated.map(c => [c[0], c[1]]), {
                color: '#10b981',
                weight: 5,
                opacity: 0.8,
                className: 'route-line-animated',
              }).addTo(mapRef.current);
            }
          }
          
          return updated;
        });
      }
    );
  };

  const handlePause = () => {
    setIsPaused(true);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (watchIdRef.current) {
      clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const handleResume = () => {
    handleStart();
  };

  const handleStop = () => {
    if (watchIdRef.current) clearWatch(watchIdRef.current);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    
    onComplete({
      coordinates,
      distance,
      duration,
    });
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters.toFixed(0)} m`;
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const pace = duration > 0 && distance > 0 
    ? (duration / 60) / (distance / 1000) 
    : 0;

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in">
      {/* Stats Cards */}
      <div className="p-4 grid grid-cols-3 gap-3 animate-slide-down">
        <Card className="p-4 text-center glass transition-all duration-300 hover:scale-105">
          <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
            <Activity className="h-3 w-3" />
            Tiempo
          </p>
          <p className="text-2xl font-bold" data-testid="text-duration">
            {formatTime(duration)}
          </p>
        </Card>
        <Card className="p-4 text-center glass transition-all duration-300 hover:scale-105">
          <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
            <MapPin className="h-3 w-3" />
            Distancia
          </p>
          <p className="text-2xl font-bold" data-testid="text-distance">
            {formatDistance(distance)}
          </p>
        </Card>
        <Card className="p-4 text-center glass transition-all duration-300 hover:scale-105">
          <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
            <Zap className="h-3 w-3" />
            Ritmo
          </p>
          <p className="text-2xl font-bold" data-testid="text-pace">
            {pace > 0 ? pace.toFixed(1) : '0.0'}
          </p>
          <p className="text-xs text-muted-foreground">min/km</p>
        </Card>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" data-testid="tracker-map" />
        
        {coordinates.length > 0 && (
          <Card className="absolute top-4 right-4 p-3 glass animate-bounce-in">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-medium">{coordinates.length} puntos</span>
            </div>
          </Card>
        )}

        {isTracking && !isPaused && (
          <div className="absolute top-4 left-4 animate-pulse">
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-full shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              <span className="text-sm font-medium">Grabando</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3 animate-slide-up">
        {!isTracking ? (
          <Button
            size="lg"
            className="w-full h-16 text-lg gradient-primary border-0 hover:scale-105 active:scale-95 transition-all duration-300 group"
            onClick={handleStart}
            data-testid="button-start-tracking"
          >
            <Play className="h-7 w-7 mr-2 group-hover:scale-110 transition-transform" />
            Iniciar Ruta
          </Button>
        ) : (
          <div className="flex gap-3">
            {!isPaused ? (
              <Button
                size="lg"
                variant="secondary"
                className="flex-1 h-16 hover:scale-105 active:scale-95 transition-all duration-300"
                onClick={handlePause}
                data-testid="button-pause"
              >
                <Pause className="h-6 w-6 mr-2" />
                Pausar
              </Button>
            ) : (
              <Button
                size="lg"
                className="flex-1 h-16 gradient-primary border-0 hover:scale-105 active:scale-95 transition-all duration-300"
                onClick={handleResume}
                data-testid="button-resume"
              >
                <Play className="h-6 w-6 mr-2" />
                Reanudar
              </Button>
            )}
            <Button
              size="lg"
              variant="destructive"
              className="flex-1 h-16 hover:scale-105 active:scale-95 transition-all duration-300"
              onClick={handleStop}
              data-testid="button-stop"
            >
              <Square className="h-6 w-6 mr-2" />
              Finalizar
            </Button>
          </div>
        )}
        
        <Button
          variant="ghost"
          className="w-full hover:scale-105 active:scale-95 transition-all duration-300"
          onClick={onCancel}
          data-testid="button-cancel"
        >
          Cancelar
        </Button>
      </div>

      <style>{`
        .route-line-animated {
          animation: dash 20s linear infinite;
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>
    </div>
  );
}
