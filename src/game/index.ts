import { Renderer } from "./rendering/renderer";

export const WORLD = {
    width: 800,
    height: 600,
}

export function initGame(canvas: HTMLCanvasElement) {
    const renderer = new Renderer()
    renderer.init(canvas)
}