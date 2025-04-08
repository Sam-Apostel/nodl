import * as React from 'react';

export const TooltipPosition = {
    TOP: 'top',
    TOP_RIGHT: 'top-right',
    RIGHT: 'right',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM: 'bottom',
    BOTTOM_LEFT: 'bottom-left',
    LEFT: 'left',
    TOP_LEFT: 'top-left',
} as const;

export type TooltipPosition = typeof TooltipPosition[keyof typeof TooltipPosition];

export interface ITooltipNodeProps {
    text: string;
    position: TooltipPosition;
    offset?: { x: number; y: number };
}

export interface ITooltipProps {
    text: string;
    position: TooltipPosition;
    children: React.ReactNode;
    offset?: { x: number; y: number };
    className?: string;
}
