import { useQuery } from '@tanstack/react-query';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { LeaderboardSkeleton } from '@/components/LoadingState';
import type { UserWithStats } from '@shared/schema';

export default function RankingsPage() {
  const { data: currentUser } = useQuery<UserWithStats>({
    queryKey: ['/api/current-user'],
  });

  const { data: users = [], isLoading } = useQuery<UserWithStats[]>({
    queryKey: ['/api/leaderboard'],
  });

  if (isLoading) {
    return (
      <div className="h-full overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="h-10 w-48 bg-muted animate-pulse rounded-md mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
        </div>
        <LeaderboardSkeleton />
      </div>
    );
  }

  return <LeaderboardTable users={users} currentUserId={currentUser?.id} />;
}
