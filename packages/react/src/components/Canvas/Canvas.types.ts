import type { ComponentProps } from 'react';

export type CanvasProps = ComponentProps<'div'> & {
    size: { width: number; height: number };
};
