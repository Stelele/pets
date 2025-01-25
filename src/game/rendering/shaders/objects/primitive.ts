import { IPrimitiveObject } from "./types";

export class PrimitiveObject implements IPrimitiveObject {
    public label: string;
    public width: number;
    public height: number;
    public x: number;
    public y: number;
    public type: "primitive";
    public color: number[];

    public constructor() {
        this.type = "primitive"
        this.x = 0
        this.y = 0
    }

    public getVertices() {
        return [
            this.x, this.y,
            this.x, this.y + this.height,
            this.x + this.width, this.y,
            this.x + this.width, this.y,
            this.x, this.y + this.height,
            this.x + this.width, this.y + this.height
        ]
    }
}