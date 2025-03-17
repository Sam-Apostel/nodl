import { Node, Input, Output, schema } from '@nodl/core';
import { Observable } from 'rxjs';
import z from 'zod';

type Parameter = {
	id: string;
	type: 'Part' | 'File' | 'Text' | 'Platform' | 'number' | 'ID' | string;
	value?: string;
	name: string;
};

export class Operation extends Node {
	public inputs: Record<string, Input>;
	public outputs: Record<string, Output>;
	constructor(
		public id: string,
		public name: string,
		public category: string,
		public position: { x: number; y: number },
		inputs: Array<Parameter>,
		outputs: Array<Parameter>,
	) {
		super();
		this.inputs = Object.fromEntries(
			inputs.map((input) => {
				if (input.type === 'number') {
					return [
						input.id,
						new Input({
							name: input.name,
							type: schema('number', z.number()),
							defaultValue: 0,
						}),
					];
				}

				return [
					input.id,
					new Input({
						name: input.name,
						type: schema(input.type, z.string()),
						defaultValue: '',
					}),
				];
			}),
		);
		this.outputs = Object.fromEntries(
			outputs.map((output) => {
				if (output.type === 'number') {
					return [
						output.id,
						new Output({
							name: output.name,
							type: schema('number', z.number()),
							observable: new Observable<number>(),
						}),
					];
				}

				return [
					output.id,
					new Output({
						name: output.name,
						type: schema(output.type, z.string()),
						observable: new Observable<string>(),
					}),
				];
			}),
		);
	}
}
