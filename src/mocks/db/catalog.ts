import type { ZoneIcon, ZoneStatus, ZoneType } from '@/api/schemas';

/**
 * Casa Rural El Olivar — 11 zones, 24 meters, 14 rooms (Figma: "11 zones · 24 meters").
 * September targets and the change vs August are the numbers shown in the Figma screens; the
 * generator shapes realistic daily/hourly curves and then scales every zone to these totals.
 */
export interface ZoneSpec {
  id: string;
  name: string;
  type: ZoneType;
  detail: string;
  icon: ZoneIcon;
  meters: { code: string; name: string }[];
  /** Name inside its zone-type page (Climate → "Main building"). */
  subName: string;
  status: ZoneStatus;
  /** kWh in September 2026. */
  sep: number;
  /** Change vs August (Figma Zones table). */
  vsAug: number;
  /** How the daily load reacts: temperature, occupancy, constant, night length or pool cover. */
  driver: 'cooling' | 'occupancy' | 'kitchen' | 'pool' | 'constant' | 'night';
}

export const PROPERTY = {
  id: 'olivar',
  name: 'Casa Rural El Olivar',
  location: 'Ronda',
  rooms: 14,
  contractedKw: 45,
  user: { name: 'Lucía Martín', initials: 'LM', role: 'Manager' },
};

export const ZONES: ZoneSpec[] = [
  {
    id: 'climate-main',
    name: 'Climate · Main building',
    subName: 'Main building',
    type: 'climate',
    detail: 'Heat pumps · 2 meters',
    icon: 'thermometer',
    meters: [
      { code: 'C-01', name: 'Main heat pump' },
      { code: 'C-02', name: 'Main fan coils' },
    ],
    status: 'attention',
    sep: 1024,
    vsAug: -0.132,
    driver: 'cooling',
  },
  {
    id: 'pool-heat-pump',
    name: 'Pool heat pump',
    subName: 'Heat pump',
    type: 'pool',
    detail: 'Pool · 1 meter',
    icon: 'waves',
    meters: [{ code: 'P-01', name: 'Pool heat pump' }],
    status: 'alert',
    sep: 902,
    vsAug: 0.183,
    driver: 'pool',
  },
  {
    id: 'climate-annex',
    name: 'Climate · Annex',
    subName: 'Annex',
    type: 'climate',
    detail: 'Heat pump · 1 meter',
    icon: 'thermometer',
    meters: [{ code: 'C-03', name: 'Annex heat pump' }],
    status: 'normal',
    sep: 618,
    vsAug: -0.181,
    driver: 'cooling',
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    subName: 'Kitchen',
    type: 'kitchen',
    detail: 'Kitchen · 2 meters',
    icon: 'utensils',
    meters: [
      { code: 'K-01', name: 'Kitchen appliances' },
      { code: 'K-02', name: 'Cold room' },
    ],
    status: 'attention',
    sep: 486,
    vsAug: 0.097,
    driver: 'kitchen',
  },
  {
    id: 'rooms-floor-1',
    name: 'Rooms · Floor 1',
    subName: 'Floor 1',
    type: 'rooms',
    detail: '6 rooms · 6 meters',
    icon: 'bed',
    meters: [101, 102, 103, 104, 105, 106].map((r) => ({ code: `R-${r}`, name: `Room ${r}` })),
    status: 'normal',
    sep: 412,
    vsAug: -0.051,
    driver: 'occupancy',
  },
  {
    id: 'rooms-floor-2',
    name: 'Rooms · Floor 2',
    subName: 'Floor 2',
    type: 'rooms',
    detail: '5 rooms · 5 meters',
    icon: 'bed',
    meters: [201, 202, 203, 204, 205].map((r) => ({ code: `R-${r}`, name: `Room ${r}` })),
    status: 'normal',
    sep: 368,
    vsAug: -0.022,
    driver: 'occupancy',
  },
  {
    id: 'pool-filtration',
    name: 'Pool filtration',
    subName: 'Filtration',
    type: 'pool',
    detail: 'Pool · 1 meter',
    icon: 'waves',
    meters: [{ code: 'P-02', name: 'Filtration pump' }],
    status: 'normal',
    sep: 253,
    vsAug: 0.004,
    driver: 'constant',
  },
  {
    id: 'rooms-annex',
    name: 'Rooms · Annex',
    subName: 'Annex',
    type: 'rooms',
    detail: '3 rooms · 3 meters',
    icon: 'bed',
    meters: [301, 302, 303].map((r) => ({ code: `R-${r}`, name: `Room ${r}` })),
    status: 'normal',
    sep: 230,
    vsAug: -0.078,
    driver: 'occupancy',
  },
  {
    id: 'laundry',
    name: 'Laundry',
    subName: 'Laundry',
    type: 'kitchen',
    detail: 'Kitchen & laundry · 1 meter',
    icon: 'zap',
    meters: [{ code: 'L-01', name: 'Laundry' }],
    status: 'normal',
    sep: 188,
    vsAug: 0.019,
    driver: 'occupancy',
  },
  {
    id: 'lounge',
    name: 'Lounge & reception',
    subName: 'Lounge & reception',
    type: 'common',
    detail: 'Common areas · 1 meter',
    icon: 'sofa',
    meters: [{ code: 'A-01', name: 'Lounge & reception' }],
    status: 'normal',
    sep: 176,
    vsAug: -0.011,
    driver: 'cooling',
  },
  {
    // Not visible in the Figma table (page 2). Its August value absorbs the gap so the property
    // total drops 6.1% as the Overview KPI says: the garden timer was stuck "on" in August.
    id: 'exterior-lighting',
    name: 'Exterior lighting',
    subName: 'Exterior lighting',
    type: 'common',
    detail: 'Common areas · 1 meter',
    icon: 'lightbulb',
    meters: [{ code: 'A-02', name: 'Garden & parking lights' }],
    status: 'normal',
    sep: 155,
    vsAug: -0.502,
    driver: 'night',
  },
];

export const TYPE_DESCRIPTION: Record<ZoneType, string> = {
  climate: 'air-to-water heat pumps',
  pool: 'heat pump and filtration',
  rooms: 'guest rooms and en-suite',
  kitchen: 'kitchen, cold room and laundry',
  common: 'lounge, reception and exterior',
};

/** €/kWh, VAT included — mean of the three 2.0TD periods (Figma Settings: 0.2145). */
export const PRICE: Record<string, number> = { '2026-07': 0.2088, '2026-08': 0.21046, '2026-09': 0.2145 };

/** Guest nights per month (Figma: 9.4 kWh per guest night in September, +3.2% vs August). */
export const GUEST_NIGHTS: Record<string, number> = { '2026-07': 598, '2026-08': 563, '2026-09': 512 };
