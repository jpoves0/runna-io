import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FriendsList } from '@/components/FriendsList';
import { LoadingState } from '@/components/LoadingState';
import { LoginDialog } from '@/components/LoginDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useSession } from '@/hooks/use-session';
import type { UserWithStats } from '@shared/schema';

export default function FriendsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user: currentUser, isLoading: userLoading, login } = useSession();

  const { data: friends = [], isLoading } = useQuery<UserWithStats[]>({
    queryKey: ['/api/friends', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const handleAddFriend = () => {
    setIsAddDialogOpen(true);
  };

  const handleViewTerritory = (userId: string) => {
    console.log('View territory for user:', userId);
  };

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

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
            Inicia sesion para ver tus amigos
          </p>
          <Button onClick={() => setIsLoginOpen(true)} data-testid="button-login-friends">
            Iniciar sesion
          </Button>
        </div>
        <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} onLogin={login} />
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState message="Cargando amigos..." />;
  }

  return (
    <>
      <FriendsList
        friends={friends}
        onAddFriend={handleAddFriend}
        onViewTerritory={handleViewTerritory}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir amigo</DialogTitle>
            <DialogDescription>
              Busca usuarios por nombre de usuario para añadirlos como amigos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Input
              placeholder="Buscar por @usuario..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-friend"
            />
            
            <Button
              onClick={handleSearch}
              className="w-full"
              data-testid="button-search"
            >
              Buscar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
