import { Renderer } from "./rendering/renderer";
import { PrimitiveObject } from "./rendering/shaders/objects/primitive";
import { ObjectType } from "./rendering/shaders/objects/types";

export const WORLD = {
    width: 800,
    height: 600,
}

export async function initGame(canvas: HTMLCanvasElement) {
    const renderer = new Renderer()
    await renderer.init(canvas)

    const obj = new PrimitiveObject()
    obj.x = WORLD.width / 10
    obj.y = WORLD.height / 10
    obj.width = 500
    obj.height = 500
    obj.color = [0.8, 0.8, 0, 1]
    obj.type = ObjectType.rect
    renderer.addObjects([obj])
}