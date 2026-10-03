import { useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Download, Ellipsis, Layers, Table } from 'lucide-react';
import type { Hourly } from '@/api/schemas';
import { HourlyConsumptionChart } from '@/components/charts/HourlyConsumptionChart/HourlyConsumptionChart';
import { Card } from '@/components/layout/Page/Page';
import { IconButton } from '@/components/ui/IconButton/IconButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/Menu/DropdownMenu';
import { formatDayShort, parseLocal } from '@/lib/format';

export function HourlyCard({ query, className }: { query: UseQueryResult<Hourly>; className?: string }) {
  const [showTable, setShowTable] = useState(false);
  const h = query.data;
  const day = h ? parseLocal(h.date) : undefined;
  const isToday = h?.points.some((p) => p.kwh === null) ?? true;
  const dayName = h?.weekday ?? 'Tuesday';
  const empty = h && h.points.every((p) => p.kwh === null);

  return (
    <Card
      className={className}
      title="Consumption by hour"
      subtitle={
        <>
          <span className="max-sm:hidden">
            {isToday ? 'Today' : day ? formatDayShort(day) : '…'} vs a typical {dayName} · kWh per hour
          </span>
          <span className="sm:hidden">
            {isToday ? 'Today' : day ? formatDayShort(day) : '…'} vs typical {dayName} · kWh
          </span>
        </>
      }
      actions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton
              variant="ghost"
              icon={Ellipsis}
              label="Chart options"
              tooltip={false}
              className="max-sm:hidden"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem icon={Table} onSelect={() => setShowTable((v) => !v)} disabled={!h}>
              {showTable ? 'Hide data table' : 'Show data table'}
            </DropdownMenuItem>
            <DropdownMenuItem icon={Download} disabled={!h} onSelect={() => h && downloadHourly(h)}>
              Download CSV
            </DropdownMenuItem>
            <DropdownMenuItem icon={Layers} asChild>
              <Link to="/zones">Consumption by zone</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <HourlyConsumptionChart
        status={query.isPending ? 'loading' : query.isError ? 'error' : empty ? 'empty' : 'ready'}
        data={h?.points ?? []}
        contractedKw={h?.contractedKw ?? 45}
        typicalLabel={`Typical ${dayName}`}
        dayLabel={day ? formatDayShort(day) : ''}
        onRetry={() => void query.refetch()}
        showTable={showTable}
        onShowTableChange={setShowTable}
      />
    </Card>
  );
}

function downloadHourly(h: Hourly) {
  const csv = [
    'hour,kwh,typical',
    ...h.points.map((p) => `${String(p.hour).padStart(2, '0')}:00,${p.kwh ?? ''},${p.typical}`),
  ].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  Object.assign(document.createElement('a'), { href: url, download: `watt-hourly-${h.date}.csv` }).click();
  URL.revokeObjectURL(url);
}
