import { useState } from 'react';
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
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { toast } = useToast();
  const { user, isLoading, logout, login } = useSession();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Sesion cerrada',
      description: 'Has cerrado sesion exitosamente',
    });
    setIsLogoutDialogOpen(false);
    setIsLoginOpen(true);
  };

  if (isLoading) {
    return <LoadingState message="Cargando perfil..." />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <User className="h-20 w-20 mx-auto text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">No has iniciado sesion</h2>
          <p className="text-muted-foreground">
            Inicia sesion para acceder a tu perfil
          </p>
          <Button
            onClick={() => setIsLoginOpen(true)}
            data-testid="button-login-prompt"
          >
            Iniciar sesion
          </Button>
        </div>
        <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} onLogin={login} />
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
      <div className="flex flex-col min-h-full">
        <div className="p-6 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            Perfil
          </h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="relative group">
              <Avatar className="h-28 w-28 ring-4 ring-offset-4"
                style={{ '--tw-ring-color': user.color } as React.CSSProperties}
              >
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback style={{ backgroundColor: user.color }}>
                  <span className="text-white text-3xl font-bold">
                    {getInitials(user.name)}
                  </span>
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>

            {user.rank && (
              <Badge variant="secondary" className="gap-1">
                <Trophy className="h-4 w-4" />
                Puesto #{user.rank}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold" data-testid="text-total-area">
                {user.totalArea.toLocaleString('es-ES', {
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-sm text-muted-foreground">m2 conquistados</p>
            </Card>

            <Card className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold" data-testid="text-friend-count">
                {user.friendCount || 0}
              </p>
              <p className="text-sm text-muted-foreground">amigos</p>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Tu color de territorio</h3>
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-xl border-2 border-border shadow-lg"
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

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setIsSettingsOpen(true)}
              data-testid="button-settings"
            >
              <Settings className="h-5 w-5 mr-2" />
              Configuracion
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => setIsLogoutDialogOpen(true)}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Cerrar sesion
            </Button>
          </div>
        </div>
      </div>

      <SettingsDialog 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen}
        user={user}
      />

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cerrar sesion?</AlertDialogTitle>
            <AlertDialogDescription>
              Tendras que iniciar sesion nuevamente para acceder a tu cuenta
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-destructive hover:bg-destructive/90"
            >
              Cerrar sesion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} onLogin={login} />
    </ScrollArea>
  );
}
