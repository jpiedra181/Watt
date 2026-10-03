import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { setScenario } from '@/mocks/scenario';
import { axeViolations, renderApp } from '@/test/render';

describe('Zones — table state lives in the URL', () => {
  it('sorts, selects and pages, writing everything to the query string', async () => {
    const { user, router } = renderApp('/zones');
    const table = await screen.findByRole('table', { name: /Zones, sorted by consumption, descending/ });
    await within(table).findByRole('link', { name: 'Climate · Main building' });
    expect(within(table).getAllByRole('row')).toHaveLength(11); // header + 10

    await user.click(within(table).getByRole('button', { name: /Cost/ }));
    await waitFor(() => expect(router.state.location.search).toMatchObject({ sort: 'cost.desc' }));
    expect(within(table).getByRole('button', { name: /Cost/ }).closest('th')).toHaveAttribute(
      'aria-sort',
      'descending',
    );

    await user.click(screen.getByRole('checkbox', { name: 'Select Pool heat pump' }));
    await waitFor(() => expect(router.state.location.search).toMatchObject({ selected: 'pool-heat-pump' }));
    expect(screen.getByRole('toolbar', { name: 'Bulk actions' })).toHaveTextContent('1 zone selected');

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({ page: 2, selected: 'pool-heat-pump' }),
    );
    expect(await screen.findByText('Showing 11–11 of 11 zones')).toBeInTheDocument();
  });

  it('restores filters from a shared link and filters on the server', async () => {
    renderApp('/zones?type=rooms&status=normal');
    expect(await screen.findByText('Showing 1–3 of 3 zones')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Zone type' })).toHaveTextContent('Rooms');
  });

  it('searches with a debounce and offers to clear filters when nothing matches', async () => {
    const { user, router } = renderApp('/zones');
    await screen.findByRole('table');
    await user.type(screen.getByRole('searchbox', { name: 'Search zones' }), 'sauna');
    expect(await screen.findByText('No zones match “sauna”', {}, { timeout: 2000 })).toBeInTheDocument();
    expect(router.state.location.search).toMatchObject({ q: 'sauna' });
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(await screen.findByText('Showing 1–10 of 11 zones')).toBeInTheDocument();
  });

  it('shows an error state with Retry when the gateway fails', async () => {
    setScenario({ errors: 'all' }, { persist: false });
    const { user } = renderApp('/zones');
    expect(await screen.findByText('Couldn’t load zones')).toBeInTheDocument();
    setScenario({ errors: 'none' }, { persist: false });
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });
});

describe('Alerts', () => {
  it('marks an alert reviewed optimistically and offers Undo', async () => {
    const { user } = renderApp('/alerts');
    const button = await screen.findByRole('button', { name: 'Mark reviewed: Peak over contracted power' });
    await user.click(button);
    expect(
      await screen.findByRole('button', { name: 'Resolve: Peak over contracted power' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Marked as reviewed')).toBeInTheDocument();
  });

  it('rolls back and explains when the update fails', async () => {
    const { user } = renderApp('/alerts');
    await screen.findByRole('button', { name: 'Mark reviewed: Night consumption above baseline' });
    setScenario({ errors: 'all' }, { persist: false });
    await user.click(screen.getByRole('button', { name: 'Mark reviewed: Night consumption above baseline' }));
    expect(await screen.findByText('Couldn’t update the alert')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Mark reviewed: Night consumption above baseline' }),
    ).toBeInTheDocument();
  });

  it('filters by status through the tabs', async () => {
    const { user, router } = renderApp('/alerts');
    await screen.findByRole('tab', { name: /All/ });
    await user.click(screen.getByRole('tab', { name: /Resolved/ }));
    await waitFor(() => expect(router.state.location.search).toMatchObject({ status: 'resolved' }));
    expect(await screen.findByText('Dryer running at peak tariff')).toBeInTheDocument();
    expect(screen.queryByText('Heat pump running in empty rooms')).not.toBeInTheDocument();
  });
});

describe('Settings', () => {
  it('validates contracted power and summarises what needs attention', async () => {
    const { user } = renderApp('/settings');
    const field = await screen.findByLabelText('Contracted power (kW)');
    await user.clear(field);
    await user.type(field, '4,5');
    await user.tab();
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription(
      'Enter a value between 10 and 100 kW — use a dot for decimals.',
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('1 field needs attention · Contracted power');

    await user.clear(field);
    await user.type(field, '50');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Settings saved')).toBeInTheDocument();
  });
});

describe('Accessibility (axe, jsdom)', () => {
  it.each(['/overview', '/zones', '/zones/climate', '/alerts', '/settings'])(
    '%s has no axe violations',
    async (url) => {
      const { container } = renderApp(url);
      await screen.findByRole('heading', { level: 1 }, { timeout: 5000 });
      // Let the mock API answer so the loaded state is audited, not only the skeletons.
      await waitFor(() => expect(container.querySelector('[aria-busy="true"]')).toBeNull(), {
        timeout: 3000,
      });
      expect(await axeViolations(container)).toEqual([]);
    },
  );
});
