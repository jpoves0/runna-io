import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ActivityFeed } from '@/components/ActivityFeed';
import { LoadingState } from '@/components/LoadingState';
import { LoginDialog } from '@/components/LoginDialog';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useSession } from '@/hooks/use-session';
import type { RouteWithTerritory } from '@shared/schema';

export default function ActivityPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user: currentUser, isLoading: userLoading, login } = useSession();

  const { data: routes = [], isLoading } = useQuery<RouteWithTerritory[]>({
    queryKey: ['/api/routes', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  if (userLoading) {
    return <LoadingState message="Cargando..." />;
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center space-y-4">
          <User className="h-20 w-20 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Inicia sesion</h2>
          <p className="text-muted-foreground">
            Inicia sesion para ver tu actividad
          </p>
          <Button onClick={() => setIsLoginOpen(true)} data-testid="button-login-activity">
            Iniciar sesion
          </Button>
        </div>
        <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} onLogin={login} />
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState message="Cargando actividades..." />;
  }

  return <ActivityFeed routes={routes} />;
}
