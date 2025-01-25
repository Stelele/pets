interface IBaseObject {
    label: string
    width: number
    height: number
    x: number
    y: number
    color: number[]
    getVertices: () => number[]
}

export interface IPrimitiveObject extends IBaseObject {
    type: 'primitive'
}

export interface ITextureObject extends IBaseObject {
    type: 'texture'
    image: ImageBitmap
    texture: GPUTexture
    verticesBuffer: GPUBuffer
    uvsBuffer: GPUBuffer
    getUVs: () => number[]
}

export type IRenderObject = IPrimitiveObject | ITextureObject
export type ObjectType = 'texture' | 'primitive'