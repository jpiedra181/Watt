import { useState } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderUi } from '@/test/render';
import { Button } from './Button/Button';
import { Checkbox } from './Checkbox/Checkbox';
import { Input } from './Input/Input';
import { pageItems, Pagination } from './Pagination/Pagination';
import { Select } from './Select/Select';
import { Toggle } from './Toggle/Toggle';

describe('Button', () => {
  it('runs onClick from mouse and keyboard', async () => {
    const onClick = vi.fn();
    const { user } = renderUi(<Button onClick={onClick}>Save changes</Button>);
    const button = await screen.findByRole('button', { name: 'Save changes' });
    await user.click(button);
    button.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('keeps its name and focus while loading but ignores clicks', async () => {
    const onClick = vi.fn();
    const { user } = renderUi(
      <Button loading onClick={onClick}>
        Resolve 3 alerts
      </Button>,
    );
    const button = await screen.findByRole('button', { name: 'Resolve 3 alerts' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).not.toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Input', () => {
  it('links the error message and marks the field invalid', async () => {
    renderUi(
      <Input
        label="Contracted power (kW)"
        defaultValue="4,5"
        error="Enter a value between 10 and 100 kW."
        helper="Never shown with an error"
      />,
    );
    const input = await screen.findByLabelText('Contracted power (kW)');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter a value between 10 and 100 kW.');
    expect(screen.queryByText('Never shown with an error')).not.toBeInTheDocument();
  });
});

describe('Checkbox and Toggle', () => {
  function Controlled() {
    const [checked, setChecked] = useState(false);
    const [on, setOn] = useState(true);
    return (
      <>
        <Checkbox label="Notify the maintenance team" checked={checked} onCheckedChange={setChecked} />
        <Toggle label="Daily summary email" checked={on} onCheckedChange={setOn} />
      </>
    );
  }

  it('toggle with the label, Space and click', async () => {
    const { user } = renderUi(<Controlled />);
    const box = await screen.findByRole('checkbox', { name: 'Notify the maintenance team' });
    await user.click(screen.getByText('Notify the maintenance team'));
    expect(box).toBeChecked();
    const sw = screen.getByRole('switch', { name: 'Daily summary email' });
    sw.focus();
    await user.keyboard(' ');
    expect(sw).not.toBeChecked();
  });
});

describe('Select', () => {
  it('is a labelled combobox that opens with the keyboard', async () => {
    const onChange = vi.fn();
    const { user } = renderUi(
      <Select
        label="Zone type"
        onValueChange={onChange}
        options={[
          { value: 'pool', label: 'Pool' },
          { value: 'rooms', label: 'Rooms' },
        ]}
      />,
    );
    const trigger = await screen.findByRole('combobox', { name: 'Zone type' });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Rooms' }));
    expect(onChange).toHaveBeenCalledWith('rooms');
  });
});

describe('Pagination', () => {
  it('shows at most five slots like the Figma variants', () => {
    expect(pageItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageItems(1, 9)).toEqual([1, 2, 3, 'ellipsis', 9]);
    expect(pageItems(5, 9)).toEqual([1, 'ellipsis', 5, 'ellipsis', 9]);
    expect(pageItems(9, 9)).toEqual([1, 'ellipsis', 7, 8, 9]);
  });

  it('marks the current page and disables the ends', async () => {
    const onPage = vi.fn();
    const { user } = renderUi(
      <Pagination page={1} pageSize={10} total={11} itemLabel="zones" onPageChange={onPage} />,
    );
    expect(await screen.findByText('Showing 1–10 of 11 zones')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPage).toHaveBeenCalledWith(2);
  });
});
