/** @jsxImportSource @emotion/react */
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { ComponentProps } from 'react';

import { canvasWrapperStyles, canvasContentStyles } from './Canvas.styles';
import { StoreContext } from '../../stores/CircuitStore/CircuitStore';
import { fromCartesianPoint } from '../../utils/coordinates/coordinates';


export type CanvasProps = Omit<ComponentProps<'div'>, 'className'> & {
    className?: string;
    size: { width: number; height: number };
    scrollRef: React.RefObject<HTMLDivElement>;
};

export const Canvas = observer(
    React.forwardRef<HTMLDivElement, CanvasProps>(
        ({ size, className, scrollRef, ...props }: CanvasProps, ref) => {
            const { store } = React.useContext(StoreContext);

            React.useEffect(() => {
                if (!scrollRef.current) return;

                const { x, y } = fromCartesianPoint(size.width, size.height, 0, 0);
                const { x: offsetX, y: offsetY } = fromCartesianPoint(
                    scrollRef.current.clientWidth,
                    scrollRef.current.clientHeight,
                    0,
                    0
                );

                scrollRef.current.scrollTo({ left: x - offsetX, top: y - offsetY });

            }, []);

            return (
                <div ref={scrollRef} css={canvasWrapperStyles} className={className}>
                    <div
                        ref={ref}
                        css={canvasContentStyles(size, store.zoomFactor)}
                        className="canvas"
                        {...props}
                    />
                </div>
            );
        }
    )
);
