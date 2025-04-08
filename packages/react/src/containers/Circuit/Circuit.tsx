import clsx from 'clsx';
import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import styles from './Circuit.module.css';
import { CircuitProps, NodeWindowResolver } from './Circuit.types';
import { Canvas } from '../../components/Canvas/Canvas';
import { Connection } from '../../components/Connection/Connection';
import { Node } from '../../components/Node/Node';
import { CANVAS_SIZE } from '../../constants';
import { useKeyboardActions } from '../../hooks/useKeyboardActions/useKeyboardActions';
import { StoreContext } from '../../stores/CircuitStore/CircuitStore';
import { normalizeBounds } from '../../utils/bounds/bounds';

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

    if (!store.selectionBounds) return null;

    const bounds = normalizeBounds(store.selectionBounds);

    return <div
        className={styles.circuitSelection}
        style={{
            '--x': bounds.x,
            '--y': bounds.y,
            '--width': bounds.width,
            '--height': bounds.height
        } as React.CSSProperties}
    />;
});

export const Circuit = observer((props: CircuitProps) => {
    const {
        store,
        nodeWindowResolver,
        onNodeRemoval,
        onConnection,
        onConnectionRemoval,
        onSelectionChanged,
        ...divProps
    } = props;

    useKeyboardActions(store);

        const onMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.nativeEvent.clientX - rect.left;
            const y = e.nativeEvent.clientY - rect.top;

            store.setMousePosition({ x, y });

            if (store.selectionBounds) {
                const { x, y, width, height } = store.selectionBounds;

                const bounds = {
                    x,
                    y,
                    width: width + e.movementX,
                    height: height + e.movementY
                };

                store.setSelectionBounds(bounds);
            }
        }, []);

        const onMouseDown = React.useCallback(({ nativeEvent }: React.MouseEvent<HTMLDivElement>) => {
            if ((nativeEvent.target as HTMLDivElement).id === 'connections') {
                store.setSelectionBounds({
                    x: store.mousePosition.x,
                    y: store.mousePosition.y,
                    width: 0,
                    height: 0
                });
            }
        }, [store]);

        const onMouseUp = React.useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            store.setDraftConnectionSource(null);
            store.setSelectionBounds(null);
        }, [store]);

        React.useEffect(() => {
            return reaction(
                () => store.connections,
                (connections, prevConnections) => {
                    const addedConnections = connections.filter(connection => !prevConnections.includes(connection));
                    const removedConnections = prevConnections.filter(connection => !connections.includes(connection));

                    if (addedConnections.length && onConnection) {
                        for (const connection of addedConnections) {
                            onConnection(connection);
                        }
                    }

                    if (removedConnections.length && onConnectionRemoval) {
                        for (const connection of removedConnections) {
                            onConnectionRemoval(connection);
                        }
                    }
                }
            );
        }, [store, onConnection, onConnectionRemoval]);

        React.useEffect(() => {
            return reaction(
                () => store.nodes,
                (nodes, prevNodes) => {
                    const removedNodes = prevNodes.filter(node => !nodes.includes(node));

                    if (removedNodes.length && onNodeRemoval) {
                        for (const node of removedNodes) {
                            onNodeRemoval(node);
                        }
                    }
                }
            );
        }, [store, onNodeRemoval]);

        React.useEffect(() => {
            return reaction(
                () => store.selectedNodes,
                (selectedNodes) => {
                    onSelectionChanged?.(selectedNodes);
                }
            );
        }, [onSelectionChanged, store]);

        return (
            <StoreContext value={{ store }}>
                <Canvas
                    {...divProps}
                    className={clsx(divProps.className, styles.circuitContainer)}
                    size={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                >
                    <Nodes windowResolver={nodeWindowResolver} />
                    <Connections />
                    <Selection />
                </Canvas>
            </StoreContext>
        );
    });
