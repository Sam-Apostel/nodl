import clsx from 'clsx';
import * as React from 'react';

import styles from './Tooltip.module.css';
import { ITooltipNodeProps, ITooltipProps } from './Tooltip.types';
import { useHover } from '../../hooks/useHover/useHover';

const TooltipNode = ({ text, position, offset }: ITooltipNodeProps) => {
    const ref = React.useRef<HTMLSpanElement>(null);
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

    React.useEffect(() => {
        const { width, height } = ref.current?.getBoundingClientRect() || { width: 0, height: 0 };

        setDimensions({ width, height });
    }, []);

    return (
        <span ref={ref} className={styles.tooltip} data-position={position} style={{
            '--offset-x': offset?.x,
            '--offset-y': offset?.y,
            '--width': dimensions.width,
            '--height': dimensions.height,
        } as React.CSSProperties}>
            {text}
        </span>
    );
};

export const Tooltip = ({ children, className, ...tooltipNodeProps }: ITooltipProps) => {
    const { onMouseEnter, onMouseLeave, isHovered } = useHover();

    return (
        <div className={clsx(className, styles.tooltipContainer)} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <div>{children}</div>
            {isHovered && <TooltipNode {...tooltipNodeProps} />}
        </div>
    );
};
