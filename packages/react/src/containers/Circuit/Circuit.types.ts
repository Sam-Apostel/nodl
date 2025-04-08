import { Connection, Node } from '@nodl/core';

import { CircuitStore } from '../../stores/CircuitStore/CircuitStore';
import { ComponentProps } from 'react';
import * as React from 'react';

export type NodeWindowResolver = (node: Node) => React.ReactNode;

export type CircuitProps = ComponentProps<'div'> & {
    store: CircuitStore;
    nodeWindowResolver?: NodeWindowResolver;
    onNodeRemoval?(node: Node): void;
    onConnection?(connection: Connection<unknown>): void;
    onConnectionRemoval?(connection: Connection<unknown>): void;
    onSelectionChanged?(nodes: Node[]): void;
};
