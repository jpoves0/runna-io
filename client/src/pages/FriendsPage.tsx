import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FriendsList } from '@/components/FriendsList';
import { LoadingState } from '@/components/LoadingState';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { UserWithStats } from '@shared/schema';

export default function FriendsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: currentUser } = useQuery<UserWithStats>({
    queryKey: ['/api/current-user'],
  });

  const { data: friends = [], isLoading } = useQuery<UserWithStats[]>({
    queryKey: ['/api/friends', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const handleAddFriend = () => {
    setIsAddDialogOpen(true);
  };

  const handleViewTerritory = (userId: string) => {
    // Navigate to map and highlight user's territory
    console.log('View territory for user:', userId);
  };

  const handleSearch = () => {
    // Search for users - will be implemented in backend phase
    console.log('Searching for:', searchQuery);
  };

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
