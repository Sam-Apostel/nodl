/** @jsxImportSource @emotion/react */
import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { circuitContainerStyles, circuitSelectionStyles } from './Circuit.styles';
import { CircuitProps, NodeWindowResolver } from './Circuit.types';
import { Canvas } from '../../components/Canvas/Canvas';
import { Connection } from '../../components/Connection/Connection';
import { Node } from '../../components/Node/Node';
import { CANVAS_SIZE } from '../../constants';
import { useKeyboardActions } from '../../hooks/useKeyboardActions/useKeyboardActions';
import { StoreContext } from '../../stores/CircuitStore/CircuitStore';
import { normalizeBounds } from '../../utils/bounds/bounds';
import { getOffset } from './util';

const Nodes = observer(({ windowResolver }: { windowResolver?: NodeWindowResolver }) => {
    const { store } = React.useContext(StoreContext);

    return (
        <>
            {store.nodes.map(node => (
                <Node key={node.id} node={node} window={windowResolver?.(node)} />
            ))}
        </>
    );
});

const Connections = observer(() => {
    const ref = React.useRef<SVGSVGElement>(null);
    const { store } = React.useContext(StoreContext);

    const onClick = React.useCallback((e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        if (ref.current === e.target) {
            store.selectNodes([]);
        }
    }, []);

    return (
        <svg ref={ref} id="connections" width="100%" height="100%" onClick={onClick}>
            {store.connections.map(connection => (
                <Connection key={connection.id} connection={connection} />
            ))}

            {store.draftConnectionSource && <Connection output={store.draftConnectionSource} />}
        </svg>
    );
});

const Selection = observer(() => {
    const { store } = React.useContext(StoreContext);

    return store.selectionBounds ? <div css={circuitSelectionStyles(normalizeBounds(store.selectionBounds))} /> : null;
});

export const Circuit = observer(
    React.forwardRef<HTMLDivElement, CircuitProps>((props, ref) => {
        useKeyboardActions(props.store);

        const canvasRef = React.useRef<HTMLDivElement>(null);

        const [keys, setKeys] = useState({ altKey: false, ctrlKey: false, metaKey: false, shiftKey: false });

        useEffect(() => {
            const abortController = new AbortController();
            window.addEventListener('keydown', ({ altKey, ctrlKey, metaKey, shiftKey }) => setKeys({ altKey, ctrlKey, metaKey, shiftKey }), { signal: abortController.signal });
            window.addEventListener('keyup', ({ altKey, ctrlKey, metaKey, shiftKey }) => setKeys({ altKey, ctrlKey, metaKey, shiftKey }), { signal: abortController.signal });
            return () => abortController.abort();
        }, []);

        const scrollRef = React.useRef<HTMLDivElement>(null);

        const onMouseMove = React.useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                const targetIsCanvas = 'id' in e.target && e.target.id === 'connections';
                const x = targetIsCanvas
                    ? e.nativeEvent.offsetX
                    : props.store.mousePosition.x + e.nativeEvent.movementX / props.store.zoomFactor;
                const y = targetIsCanvas
                    ? e.nativeEvent.offsetY
                    : props.store.mousePosition.y + e.nativeEvent.movementY / props.store.zoomFactor;

                if (props.store.selectionBounds) {
                    const { x: selectionX, y: selectionY, width, height } = props.store.selectionBounds;

                    const bounds = {
                        x: selectionX,
                        y: selectionY,
                        width: width + e.movementX / props.store.zoomFactor,
                        height: height + e.movementY / props.store.zoomFactor
                    };

                    props.store.setSelectionBounds(bounds);
                }

                props.store.setMousePosition({ x, y });
            },
            [props]
        );

        const onMouseDown = React.useCallback(({ nativeEvent }: React.MouseEvent<HTMLDivElement>) => {
            if ((nativeEvent.target as HTMLDivElement).id === 'connections') {
                props.store.setSelectionBounds({
                    x: props.store.mousePosition.x,
                    y: props.store.mousePosition.y,
                    width: 0,
                    height: 0
                });
            }
        }, []);

        const onMouseUp = React.useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            props.store.setDraftConnectionSource(null);
            props.store.setSelectionBounds(null);
        }, []);

        const onScroll = React.useCallback((e: React.WheelEvent<HTMLDivElement>) => {
            if (!canvasRef.current) return;
            if (!scrollRef.current) return;
            if (!keys.metaKey && !keys.ctrlKey) {
                canvasRef.current.style.left = `${canvasRef.current.style.left.slice(0, -2) - e.deltaX}px`;
                canvasRef.current.style.top = `${canvasRef.current.style.top.slice(0, -2) - e.deltaY}px`;

                return;
            }

            props.store.setZoomFactor(props.store.zoomFactor + (e.deltaY * -0.01 * props.store.zoomFactor));

            // given the previous mouse position on the canvas, zoom level and screen size, what is the next offset
            const newPos = getOffset({ ...props.store.mousePosition }, props.store.zoomFactor, CANVAS_SIZE, scrollRef.current.clientWidth, scrollRef.current.clientHeight);
            canvasRef.current.style.left = `${newPos.x}px`;
            canvasRef.current.style.top = `${newPos.y}px`;
        }, [keys]);

        React.useEffect(() => {
            return reaction(
                () => props.store.connections,
                (connections, prevConnections) => {
                    const addedConnections = connections.filter(connection => !prevConnections.includes(connection));
                    const removedConnections = prevConnections.filter(connection => !connections.includes(connection));

                    if (addedConnections.length && props.onConnection) {
                        for (const connection of addedConnections) {
                            props.onConnection(connection);
                        }
                    }

                    if (removedConnections.length && props.onConnectionRemoval) {
                        for (const connection of removedConnections) {
                            props.onConnectionRemoval(connection);
                        }
                    }
                }
            );
        }, [props]);

        React.useEffect(() => {
            return reaction(
                () => props.store.nodes,
                (nodes, prevNodes) => {
                    const removedNodes = prevNodes.filter(node => !nodes.includes(node));

                    if (removedNodes.length && props.onNodeRemoval) {
                        for (const node of removedNodes) {
                            props.onNodeRemoval(node);
                        }
                    }
                }
            );
        }, [props]);

        React.useEffect(() => {
            return reaction(
                () => props.store.selectedNodes,
                (selectedNodes, prevSelectedNodes) => {
                    props.onSelectionChanged?.(selectedNodes);
                }
            );
        }, [props]);

        return (
            <StoreContext.Provider value={{ store: props.store }}>
                <Canvas
                    scrollRef={scrollRef}
                    ref={canvasRef}
                    className={props.className}
                    css={circuitContainerStyles}
                    size={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onWheelCapture={onScroll}
                >
                    <Nodes windowResolver={props.nodeWindowResolver} />
                    <Connections />
                    <Selection />
                </Canvas>
            </StoreContext.Provider>
        );
    })
);
