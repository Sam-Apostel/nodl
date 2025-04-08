import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { CSSProperties } from 'react';

import styles from './Canvas.module.css';
import { CanvasProps } from './Canvas.types';
import { fromCartesianPoint } from '../../utils/coordinates/coordinates';

export const Canvas = observer(
    ({ size, className, ...props }: CanvasProps) => {
        const scrollRef = React.useRef<HTMLDivElement>(null);

        React.useEffect(() => {
            if (scrollRef.current) {
                const { x, y } = fromCartesianPoint(size.width, size.height, 0, 0);
                const { x: offsetX, y: offsetY } = fromCartesianPoint(
                    scrollRef.current.clientWidth,
                    scrollRef.current.clientHeight,
                    0,
                    0
                );

                scrollRef.current.scrollTo({ left: x - offsetX, top: y - offsetY });
            }
        }, []);

        return (
            <div ref={scrollRef} className={clsx(className, styles.canvasWrapper)}>
                <div
                    {...props}
                    style={{
                        '--canvas-width': size.width,
                        '--canvas-height': size.height,
                        ...props.style
                    } as CSSProperties}
                    className={clsx('canvas', styles.canvasContent)}
                />
            </div>
        );
    }
);
