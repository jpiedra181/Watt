import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { queries, useRecommendationMutation, type RecommendationAction } from '@/api/queries';
import { RecommendationCard } from '@/components/data/RecommendationCard/RecommendationCard';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { useToast } from '@/components/ui/Toast/Toast';
import { cn } from '@/lib/cn';
import { formatDayMonth, parseLocal } from '@/lib/format';

/** Overview "Top saving opportunity" — the highest-priority open recommendation. */
export function TopSavingCard({ className }: { className?: string }) {
  const query = useQuery(queries.recommendations());
  const mutation = useRecommendationMutation();
  const toast = useToast();
  const list = query.data ?? [];
  const index = list.findIndex((r) => r.status === 'open');
  const rec = list[index];

  const act = (id: string, action: RecommendationAction, title: string) =>
    mutation.mutate(
      { id, action },
      {
        onSuccess: () =>
          toast({
            tone: 'success',
            title: action === 'apply' ? 'Recommendation applied' : 'Recommendation dismissed',
            description: title,
            action: { label: 'Undo', onClick: () => mutation.mutate({ id, action: 'undo' }) },
          }),
        onError: () =>
          toast({
            tone: 'error',
            title: 'Couldn’t update the recommendation',
            description: 'Nothing changed. Try again in a moment.',
          }),
      },
    );

  return (
    <section aria-labelledby="top-saving-title" className={cn('flex min-w-0 flex-col gap-12', className)}>
      <div className="flex items-center gap-8 px-4 pt-4 @max-5xl:sr-only">
        <h2 id="top-saving-title" className="min-w-0 flex-1 type-heading-subsection text-primary">
          Top saving opportunity
        </h2>
        {rec && (
          <p className="type-caption tabular text-secondary">
            {index + 1} of {list.length}
          </p>
        )}
      </div>
      {query.isPending ? (
        <div
          className="flex flex-col gap-12 rounded-lg border border-default bg-surface p-20"
          aria-busy="true"
          aria-label="Loading recommendation"
        >
          <div className="flex justify-between">
            <Skeleton shape="block" width={32} height={32} />
            <Skeleton width={96} height={16} />
          </div>
          <Skeleton width="80%" height={12} />
          <Skeleton width="100%" height={10} />
          <Skeleton width="70%" height={10} />
          <div className="flex justify-end gap-8 pt-4">
            <Skeleton shape="block" width={80} height={36} />
            <Skeleton shape="block" width={72} height={36} />
          </div>
        </div>
      ) : query.isError ? (
        <div className="rounded-lg border border-default bg-surface">
          <EmptyState
            compact
            variant="error"
            title="Couldn’t load recommendations"
            action={
              <Button variant="secondary" leadingIcon={RefreshCw} onClick={() => void query.refetch()}>
                Retry
              </Button>
            }
            className="py-24"
          />
        </div>
      ) : rec ? (
        <RecommendationCard
          className="flex-1"
          headingLevel="h3"
          title={rec.title}
          description={rec.description}
          savings={rec.savings}
          estimate={rec.estimate}
          status={rec.status === 'applied' ? 'applied' : 'open'}
          appliedNote={
            rec.appliedAt
              ? `Applied ${formatDayMonth(parseLocal(rec.appliedAt))} · tracking savings`
              : undefined
          }
          pending={
            mutation.isPending && mutation.variables?.id === rec.id ? mutation.variables.action : undefined
          }
          onApply={() => act(rec.id, 'apply', rec.title)}
          onDismiss={() => act(rec.id, 'dismiss', rec.title)}
          onUndo={() => act(rec.id, 'undo', rec.title)}
        />
      ) : (
        <div className="rounded-lg border border-default bg-surface">
          <EmptyState
            compact
            title="You’re all caught up"
            description="New savings ideas appear as Watt learns your property’s patterns."
            className="py-24"
          />
        </div>
      )}
    </section>
  );
}
