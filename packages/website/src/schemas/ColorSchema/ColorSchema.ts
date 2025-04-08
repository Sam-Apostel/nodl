import { schema } from '@nodl/core';
import color from 'color';
import { z } from 'zod';

export const ColorSchema = schema(
    'Color',
    z.custom((data: any) => color(data))
);
