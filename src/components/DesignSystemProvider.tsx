import type { ReactNode } from 'react';
import { LucideProvider } from 'lucide-react';
import { ToastProvider } from './ui/Toast/Toast';
import { TooltipProvider } from './ui/Tooltip/Tooltip';

/**
 * Everything a Watt component expects around it — used by the app, Storybook and tests alike.
 * Icons: Figma draws every Lucide icon with a fixed 1.67px stroke at any size.
 */
export function DesignSystemProvider({ children }: { children: ReactNode }) {
  return (
    <LucideProvider strokeWidth={1.6667} absoluteStrokeWidth>
      <TooltipProvider delayDuration={300} skipDelayDuration={200}>
        <ToastProvider>{children}</ToastProvider>
      </TooltipProvider>
    </LucideProvider>
  );
}
