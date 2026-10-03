import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import tokens from '../../tokens/figma-variables.json';

// Text-style utilities (type-body, type-heading-page…) are generated from the Figma text styles,
// so tailwind-merge has to know they belong to one conflict group.
const typeStyles = Object.keys(tokens.textStyles).map((name) =>
  name
    .toLowerCase()
    .replace(/[\s/]+/g, '-')
    .replace(/-default$/, ''),
);

const twMerge = extendTailwindMerge<'text-style'>({
  extend: {
    classGroups: {
      'text-style': [{ type: typeStyles }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
