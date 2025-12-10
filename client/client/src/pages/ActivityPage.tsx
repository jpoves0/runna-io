import { useQuery } from '@tanstack/react-query';
import { ActivityFeed } from '@/components/ActivityFeed';
import { LoadingState } from '@/components/LoadingState';
import type { RouteWithTerritory, UserWithStats } from '@shared/schema';

export default function ActivityPage() {
  const { data: currentUser } = useQuery<UserWithStats>({
    queryKey: ['/api/current-user'],
  });

  const { data: routes = [], isLoading } = useQuery<RouteWithTerritory[]>({
    queryKey: ['/api/routes', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  if (isLoading) {
    return <LoadingState message="Cargando actividades..." />;
  }

  return <ActivityFeed routes={routes} />;
}
