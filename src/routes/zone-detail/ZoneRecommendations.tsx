import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { queries, useRecommendationMutation, type RecommendationAction } from '@/api/queries';
import type { ZoneType } from '@/api/schemas';
import { RecommendationCard } from '@/components/data/RecommendationCard/RecommendationCard';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { Modal, ModalClose, ModalContent } from '@/components/ui/Modal/Modal';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { useToast } from '@/components/ui/Toast/Toast';
import { formatDayMonth, parseLocal } from '@/lib/format';

/** "Savings recommendations" section of the zone page. */
export function ZoneRecommendations({ type }: { type: ZoneType }) {
  const query = useQuery(queries.recommendations(type));
  const mutation = useRecommendationMutation();
  const toast = useToast();
  const [howOpen, setHowOpen] = useState(false);
  const list = query.data ?? [];
  const kwh = list.reduce((s, r) => s + r.monthlyKwh, 0);
  const euro = list.filter((r) => r.status === 'open').reduce((s, r) => s + r.monthlyEuro, 0);

  const act = (id: string, action: RecommendationAction, title: string) =>
    mutation.mutate(
      { id, action },
      {
        onSuccess: () =>
          toast({
            tone: 'success',
            title: {
              apply: 'Recommendation applied',
              dismiss: 'Recommendation dismissed',
              undo: 'Change undone',
            }[action],
            description: title,
            ...(action !== 'undo'
              ? { action: { label: 'Undo', onClick: () => mutation.mutate({ id, action: 'undo' }) } }
              : {}),
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
    <section aria-labelledby="recs-title" className="flex flex-col gap-12">
      <div className="flex flex-wrap items-center gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 id="recs-title" className="type-heading-section text-primary">
            Savings recommendations
          </h2>
          <p className="type-caption text-secondary">
            {query.data
              ? list.length
                ? `${list.length} suggestion${list.length === 1 ? '' : 's'} · up to ${kwh} kWh and € ${euro} per month`
                : 'No suggestions right now'
              : ' '}
          </p>
        </div>
        <Button variant="ghost" onClick={() => setHowOpen(true)}>
          How we calculate this
        </Button>
      </div>

      {query.isPending ? (
        <div
          className="grid gap-16 md:grid-cols-2 xl:grid-cols-3"
          aria-busy="true"
          aria-label="Loading recommendations"
        >
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} shape="block" width="100%" height={244} className="rounded-lg" />
          ))}
        </div>
      ) : query.isError ? (
        <div className="rounded-lg border border-default bg-surface">
          <EmptyState
            variant="error"
            title="Couldn’t load recommendations"
            action={
              <Button variant="secondary" leadingIcon={RefreshCw} onClick={() => void query.refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-lg border border-default bg-surface">
          <EmptyState
            title="You’re all caught up"
            description="New savings ideas appear as Watt learns this zone’s patterns."
          />
        </div>
      ) : (
        <ul className="grid gap-16 md:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => (
            <li key={r.id} className="flex">
              <RecommendationCard
                className="flex-1"
                title={r.title}
                description={r.description}
                savings={r.savings}
                estimate={r.estimate}
                status={r.status === 'applied' ? 'applied' : 'open'}
                appliedNote={
                  r.appliedAt
                    ? `Applied ${formatDayMonth(parseLocal(r.appliedAt))} · tracking savings`
                    : undefined
                }
                pending={
                  mutation.isPending && mutation.variables?.id === r.id
                    ? mutation.variables.action
                    : undefined
                }
                onApply={() => act(r.id, 'apply', r.title)}
                onDismiss={() => act(r.id, 'dismiss', r.title)}
                onUndo={() => act(r.id, 'undo', r.title)}
              />
            </li>
          ))}
        </ul>
      )}

      <Modal open={howOpen} onOpenChange={setHowOpen}>
        <ModalContent
          title="How we calculate savings"
          footer={
            <ModalClose asChild>
              <Button>Got it</Button>
            </ModalClose>
          }
        >
          <div className="flex flex-col gap-12 type-body-small text-secondary">
            <p>
              Each suggestion compares this zone with its own baseline: the same hour, weekday and outdoor
              temperature over the last eight weeks. When a pattern repeats — cooling empty rooms, heating the
              pool with the cover open — Watt estimates the kWh you would avoid if it stopped.
            </p>
            <p>
              Euro amounts use your average price per kWh (Settings · Energy contract). Peak suggestions are
              valued at the excess charge avoided by staying under 80% of contracted power.
            </p>
            <p>
              After you apply a suggestion, Watt tracks the real saving for 30 days and updates the estimate.
            </p>
          </div>
        </ModalContent>
      </Modal>
    </section>
  );
}
