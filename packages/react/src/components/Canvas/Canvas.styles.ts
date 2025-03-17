import { css } from '@emotion/react';

export const canvasWrapperStyles = css`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

export const canvasContentStyles = (size: { width: number; height: number }, zoomFactor: number) => css`
    position: absolute;
    width: ${size.width}px;
    height: ${size.height}px;
    background-image: radial-gradient(var(--dot-color, #434437) 5%, var(--canvas-bg, #1c1e2a) 5%);
    background-position: 0 0;
    background-size: 30px 30px;
    transform: scale(${zoomFactor});
    transform-origin: 0 0;
    
    //transition: transform .1s;
`;
