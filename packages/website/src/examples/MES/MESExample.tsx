import { Circuit, CircuitStore } from '@nodl/react';
import { LevaPanel } from 'leva';
import React, { useEffect } from 'react';

import { useNodeControls } from './hooks/useNodeControls';
import { useNodeWindowResolver } from './hooks/useNodeWindowResolver';
import styles from './MESExample.module.css';
import { Operation } from './nodes';


type Parameter = {
    id: string;
    type: 'Part' | 'File' | 'Text' | 'Platform' | 'number' | 'ID' | string;
    value?: string;
    name: string;
};

type Node = {
    id: string;
    name: string;
    category: string;
    description?: string;
    inputParameters: Array<Parameter>;
    outputParameters: Array<Parameter>;
    position: { x: number, y: number};
};

type Connection = {
    id: string;
    from: {
        node: string;
        parameter: string;
    };
    to: {
        node: string;
        parameter: string;
    };
};

type Routing = {
    nodes: Array<Node>;
    connections: Array<Connection>;
};
const store = new CircuitStore();

export const MESExample = ({ state }: { state: Routing }) => {
    const nodeWindowResolver = useNodeWindowResolver();
    const { levaStore, onSelection } = useNodeControls();

    useEffect(() => {
        const nodes = state.nodes.map(
            (node) =>
                new Operation(
                    node.id,
                    node.name,
                    node.category,
                    node.position,
                    node.inputParameters,
                    node.outputParameters,
                )
        );
        state.connections.forEach(({ from, to }) => {
            const fromNode = nodes.find(node => node.id === from.node);
            const toNode = nodes.find(node => node.id === to.node);

            fromNode.outputs[from.parameter].connect(toNode.inputs[to.parameter]);
        });
        store.setNodes(nodes.map((node, i) => [node, node.position]));

        return () => {
            store.dispose();
        };
    }, [state]);

    return (

        <div style={{ position: 'relative', height: 1200 }}>
            <LevaPanel store={levaStore} titleBar={{ position: { x: -20, y: 80 } }} />
            <Circuit
                className={styles.circuit}
                store={store}
                nodeWindowResolver={nodeWindowResolver}
                onSelectionChanged={onSelection}
            />
        </div>

    );
};
