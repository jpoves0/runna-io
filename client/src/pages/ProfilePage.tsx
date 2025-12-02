import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { User, Trophy, MapPin, Users, Settings, LogOut } from 'lucide-react';
import { LoadingState } from '@/components/LoadingState';
import { SettingsDialog } from '@/components/SettingsDialog';
import { LoginDialog } from '@/components/LoginDialog';
import type { UserWithStats } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<UserWithStats>({
    queryKey: ['/api/current-user'],
  });

  const handleLogout = () => {
    // In a real app, this would clear session/token
    queryClient.clear();
    toast({
      title: '👋 Sesión cerrada',
      description: 'Has cerrado sesión exitosamente',
      className: 'animate-slide-up',
    });
    setIsLogoutDialogOpen(false);
    setIsLoginOpen(true);
  };

  if (isLoading) {
    return <LoadingState message="Cargando perfil..." />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <User className="h-20 w-20 mx-auto text-muted-foreground" />
            <div className="absolute inset-0 bg-muted-foreground/10 blur-2xl" />
          </div>
          <h2 className="text-2xl font-bold">No has iniciado sesión</h2>
          <p className="text-muted-foreground">
            Inicia sesión para acceder a tu perfil
          </p>
          <Button
            onClick={() => setIsLoginOpen(true)}
            className="gradient-primary border-0 hover:scale-105 transition-all duration-300"
          >
            Iniciar sesión
          </Button>
        </div>
        <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col min-h-full animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-br from-primary/5 to-transparent animate-slide-down">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="relative">
              <User className="h-8 w-8 text-primary" />
              <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
            </div>
            Perfil
          </h1>
        </div>

        {/* Profile Info */}
        <div className="p-6 space-y-6">
          {/* Avatar and Name */}
          <div className="flex flex-col items-center text-center gap-4 animate-scale-in">
            <div className="relative group">
              <Avatar className="h-28 w-28 ring-4 ring-offset-4 transition-all duration-300 group-hover:scale-110"
                style={{ ringColor: user.color }}
              >
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback style={{ backgroundColor: user.color }}>
                  <span className="text-white text-3xl font-bold">
                    {getInitials(user.name)}
                  </span>
                </AvatarFallback>
              </Avatar>
              <div 
                className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"
                style={{ backgroundColor: user.color }}
              />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>

            {user.rank && (
              <Badge 
                variant="secondary" 
                className={`gap-1 ${user.rank <= 3 ? 'animate-pulse' : ''}`}
              >
                <Trophy className="h-4 w-4" />
                Puesto #{user.rank}
              </Badge>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <Card className="p-4 text-center hover-elevate transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center mb-2">
                <div className="relative">
                  <MapPin className="h-6 w-6 text-primary" />
                  <div className="absolute inset-0 bg-primary/20 blur-md animate-pulse" />
                </div>
              </div>
              <p className="text-2xl font-bold">
                {user.totalArea.toLocaleString('es-ES', {
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-sm text-muted-foreground">m² conquistados</p>
            </Card>

            <Card className="p-4 text-center hover-elevate transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center mb-2">
                <div className="relative">
                  <Users className="h-6 w-6 text-primary" />
                  <div className="absolute inset-0 bg-primary/20 blur-md animate-pulse" />
                </div>
              </div>
              <p className="text-2xl font-bold">{user.friendCount || 0}</p>
              <p className="text-sm text-muted-foreground">amigos</p>
            </Card>
          </div>

          {/* Territory Color */}
          <Card className="p-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h3 className="font-semibold mb-3">Tu color de territorio</h3>
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-xl border-2 border-border shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6"
                style={{ backgroundColor: user.color }}
              />
              <div className="flex-1">
                <p className="font-medium text-lg">{user.color}</p>
                <p className="text-sm text-muted-foreground">
                  Este color representa tus conquistas en el mapa
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <Button
              variant="outline"
              className="w-full justify-start hover:scale-105 active:scale-95 transition-all duration-300 group"
              onClick={() => setIsSettingsOpen(true)}
              data-testid="button-settings"
            >
              <Settings className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Configuración
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive hover:scale-105 active:scale-95 transition-all duration-300"
              onClick={() => setIsLogoutDialogOpen(true)}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen}
        user={user}
      />

      {/* Logout Confirmation */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Tendrás que iniciar sesión nuevamente para acceder a tu cuenta
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-destructive hover:bg-destructive/90"
            >
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Login Dialog */}
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </ScrollArea>
  );
}
