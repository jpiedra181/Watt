import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Bed,
  Download,
  Ellipsis,
  Layers,
  Pencil,
  Sofa,
  Thermometer,
  Trash2,
  Utensils,
  Waves,
} from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';
import { figma, StateGrid, Surface } from '@/stories/helpers';
import { IconButton } from '../IconButton/IconButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  MenuItemPreview,
} from './DropdownMenu';

const meta = {
  title: 'Components/Overlays/Dropdown Menu',
  component: DropdownMenu,
  parameters: { ...figma('11:141') },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Single choice, as in the zone filter. Arrow keys move, typeahead jumps, Enter chooses, Esc closes. */
export const ZoneFilter: Story = {
  render: function Render() {
    const [zone, setZone] = useState('all');
    return (
      <div className="h-[300px]">
        <DropdownMenu defaultOpen modal={false}>
          <DropdownMenuTrigger asChild>
            <IconButton icon={Layers} label="Filter by zone" tooltip={false} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup value={zone} onValueChange={setZone}>
              <DropdownMenuRadioItem value="all" icon={Layers}>
                All zones
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="climate" icon={Thermometer}>
                Climate (HVAC)
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="pool" icon={Waves}>
                Pool
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="rooms" icon={Bed}>
                Rooms
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="kitchen" icon={Utensils}>
                Kitchen
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="common" icon={Sofa} disabled>
                Common areas
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
};

/** Row actions menu (Zones table, alerts). */
export const RowActions: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton variant="ghost" icon={Ellipsis} label="Actions for Pool heat pump" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem icon={Pencil}>Edit zone</DropdownMenuItem>
        <DropdownMenuItem icon={Download}>Export CSV</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={Trash2} tone="critical">
          Delete zone
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Actions for Pool heat pump' }));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole('menu')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByRole('button', { name: 'Actions for Pool heat pump' })).toHaveFocus();
  },
};

/** Figma `Menu Item` (11:136) states: Default, Hover, Selected, Disabled. */
export const MenuItemStates: Story = {
  name: 'Menu Item · all states',
  parameters: { ...figma('11:136'), layout: 'padded' },
  render: () => (
    <StateGrid
      cellWidth={220}
      columns={['Default', 'Hover', 'Selected', 'Disabled']}
      rows={[
        {
          cells: (['default', 'hover', 'selected', 'disabled'] as const).map((s) => (
            <Surface key={s}>
              <MenuItemPreview state={s} icon={Layers}>
                Option
              </MenuItemPreview>
            </Surface>
          )),
        },
      ]}
    />
  ),
};
