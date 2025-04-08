import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';

import styles from './Node.module.css';
import { NodeActionProps, NodePortsProps, NodeProps } from './Node.types';
import { NODE_POSITION_OFFSET_X } from '../../constants';
import { StoreContext } from '../../stores/CircuitStore/CircuitStore';
import { fromCanvasCartesianPoint } from '../../utils/coordinates/coordinates';
import { Port } from '../Port/Port';


export const Node = observer(({ node, window }: NodeProps) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const { store } = React.useContext(StoreContext);

    React.useEffect(() => {
        if (ref.current) {
            store.setNodeElement(node.id, ref.current);

            return () => {
                store.removeNodeElement(node.id);
            };
        }
    }, [ref]);

    const handleOnClick = React.useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!store.selectedNodes?.includes(node)) {
                store.selectNodes([node]);
            }
        },
        [node]
    );

    const handleOnFocus = React.useCallback(() => {
        if (!store.selectedNodes?.includes(node)) {
            store.selectNodes([node]);
        }
    }, [node]);

    const handleOnDrag: DraggableEventHandler = React.useCallback(
        (e, { deltaX, deltaY }) => {
            e.preventDefault();
            e.stopPropagation();

            for (const selectedNode of store.selectedNodes || []) {
                store.setNodePosition(selectedNode.id, {
                    x: (store.nodePositions.get(selectedNode.id)?.x || 0) + deltaX,
                    y: (store.nodePositions.get(selectedNode.id)?.y || 0) + -deltaY
                });
            }
        },
        [node]
    );

    const handleRemoveNode = React.useCallback(() => {
        node.dispose();

        store.removeNode(node.id);
    }, [node]);

    const active = store.selectedNodes?.indexOf(node) !== -1;
    const position = store.nodePositions.get(node.id) || { x: 0, y: 0 };

    return (
        // @ts-expect-error react-draggable hasn't been updated to react 19
        <Draggable
            nodeRef={ref}
            position={fromCanvasCartesianPoint(position.x - NODE_POSITION_OFFSET_X, position.y)}
            onDrag={handleOnDrag}
            handle=".handle"
        >
            <div
                ref={ref}
                className={styles.node}
                data-selected={active}
                onClick={handleOnClick}
                onFocus={handleOnFocus}
                tabIndex={0}
            >
                <div className={clsx('handle', styles.header)}>
                    <div className={styles.name}>
                        <span>{node.name}</span>
                    </div>
                    <div className={styles.actions}>
                        <NodeAction color="#ff4444" onClick={handleRemoveNode} />
                    </div>
                </div>
                {window ? <div className={styles.window}>{window}</div> : undefined}
                <div className={styles.content}>
                    <NodePorts ports={Object.values(node.inputs)} type="input" />
                    <NodePorts ports={Object.values(node.outputs)} type="output" />
                </div>
            </div>
        </Draggable>
    );
});

const NodeAction = ({ color = '#fff', onClick }: NodeActionProps) => {
    return <div color={color} className={styles.action} style={{
        '--color': color
    } as React.CSSProperties} onClick={onClick} />;
};

const NodePorts = ({ ports, type }: NodePortsProps) => {
    return (
        <div className={styles.ports} data-type={type}>
            {ports.map(port => (
                <Port key={port.id} port={port} type={type} />
            ))}
        </div>
    );
};
