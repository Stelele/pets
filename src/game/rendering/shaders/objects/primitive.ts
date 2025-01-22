import { IPrimitiveObject } from "./types";

export class PrimitiveObject implements IPrimitiveObject {
    public width: number;
    public height: number;
    public x: number;
    public y: number;
    public shape: "rect" | "circle";

}