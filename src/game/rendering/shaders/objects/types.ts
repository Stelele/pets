export interface IPrimitiveObject {
    label: string
    width: number
    height: number
    x: number
    y: number
    type: ObjectType
    color: number[]
    getVertices: () => number[]
}

export enum ObjectType {
    rect = 0,
}