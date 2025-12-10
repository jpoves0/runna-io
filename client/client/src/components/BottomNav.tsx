import { Map, Trophy, Activity, User } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/', label: 'Mapa', icon: Map },
  { path: '/rankings', label: 'Rankings', icon: Trophy },
  { path: '/activity', label: 'Actividad', icon: Activity },
  { path: '/profile', label: 'Perfil', icon: User },
];

export function BottomNav() {
  const [location] = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const index = navItems.findIndex(item => item.path === location);
    if (index !== -1) setActiveIndex(index);
  }, [location]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-card-border h-16 safe-area-bottom z-50 animate-slide-up">
      <div className="relative flex items-center justify-around h-full px-2">
        {/* Sliding indicator */}
        <div
          className="absolute bottom-0 h-1 bg-primary transition-all duration-300 ease-out rounded-t-full"
          style={{
            width: `${100 / navItems.length}%`,
            left: `${(100 / navItems.length) * activeIndex}%`,
          }}
        />
        
        {navItems.map((item, index) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <button
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-primary scale-110'
                    : 'text-muted-foreground hover-elevate active-elevate-2 hover:scale-105'
                }`}
              >
                <div className={`relative ${isActive ? 'animate-bounce-in' : ''}`}>
                  <Icon className={`h-5 w-5 transition-all duration-300 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />
                  )}
                </div>
                <span className={`text-xs font-medium transition-all duration-300 ${
                  isActive ? 'font-semibold' : ''
                }`}>
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
