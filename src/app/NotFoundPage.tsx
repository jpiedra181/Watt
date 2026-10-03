import { Link } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { Page } from '@/components/layout/Page/Page';

export function NotFoundPage() {
  return (
    <Page>
      <h1 tabIndex={-1} data-page-title className="sr-only">
        Page not found
      </h1>
      <div className="rounded-lg border border-default bg-surface">
        <EmptyState
          variant="no-results"
          title="This page doesn’t exist"
          description="The link may be out of date. Head back to the overview to keep monitoring El Olivar."
          action={
            <Link to="/overview" className={buttonVariants({ variant: 'secondary' })}>
              Go to Overview
            </Link>
          }
        />
      </div>
    </Page>
  );
}
