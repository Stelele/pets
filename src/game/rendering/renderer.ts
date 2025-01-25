/* eslint-disable @typescript-eslint/no-this-alias */
import { WORLD } from ".."
import { basicFragmentShader, basicVertexShader } from "./shaders/basic"
import { TextureFsShader, TextureVsShader } from "./shaders/objects/texture"
import { IRenderObject, ITextureObject, ObjectType } from "./shaders/objects/types"

export class Renderer {
    private canvas!: HTMLCanvasElement
    private device!: GPUDevice
    private context!: GPUCanvasContext
    private preferdFormat!: GPUTextureFormat

    // objects
    private objects: Record<ObjectType, IRenderObject[]> = {
        primitive: [],
        texture: [],
    }

    // shaders
    private shaders: Record<ObjectType, Record<"vert" | "frag", GPUShaderModule>> = {
        "primitive": undefined,
        "texture": undefined,
    }

    // buffers
    private worldDimensionsBuffer!: GPUBuffer
    private screenDimensionsBuffer!: GPUBuffer
    private objectsBuffer: Record<ObjectType, GPUBuffer> = {
        "primitive": undefined,
        "texture": undefined,
    }
    private propsBuffer: Record<ObjectType, GPUBuffer> = {
        "primitive": undefined,
        "texture": undefined,
    }

    // pipeline
    private bindGroups: Record<ObjectType, GPUBindGroup> = {
        primitive: undefined,
        texture: undefined,
    }
    private bindGroupLayouts: Record<ObjectType, GPUBindGroupLayout> = {
        primitive: undefined,
        texture: undefined,
    }
    private pipelines: Record<ObjectType, GPURenderPipeline> = {
        primitive: undefined,
        texture: undefined,
    }

    // rendering
    private renderPassDescriptor!: GPURenderPassDescriptor
    private sampler!: GPUSampler

    public async init(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        })
        await this.initDevice()

        this.setupShaders()
        this.setupPipeLines()
        this.setupRenderPassDescriptor()
        this.startAnimation()
    }

    public addObjects(objects: IRenderObject[]) {
        this.objects.primitive = []
        this.objects.texture = []
        for (const object of objects) {
            switch (object.type) {
                case "primitive": {
                    this.objects.primitive.push(object)
                    break
                }
                case "texture": {
                    this.objects.texture.push(object)
                    break
                }
            }
        }

        this.setupBuffers()
    }

    private setupShaders() {
        this.shaders["primitive"] = {
            vert: this.device.createShaderModule({
                label: "Primitive Vertex Shader",
                code: basicVertexShader,
            }),
            frag: this.device.createShaderModule({
                label: "Primitive Fragment Shader",
                code: basicFragmentShader,
            })
        }

        this.shaders["texture"] = {
            vert: this.device.createShaderModule({
                label: "Texture Vertex Shader",
                code: TextureVsShader,
            }),
            frag: this.device.createShaderModule({
                label: "Texture Fragment Shader",
                code: TextureFsShader,
            })
        }
    }

    private async initDevice() {
        const adapter = await navigator.gpu.requestAdapter()
        const device = await adapter.requestDevice()
        if (!device) {
            console.error("Failed to get device")
            throw new Error("Failed to get gpu device")
        }
        this.device = device

        const context = this.canvas.getContext("webgpu")
        this.preferdFormat = navigator.gpu.getPreferredCanvasFormat()
        this.context = context
        this.context.configure({
            device: this.device,
            format: this.preferdFormat,
        })

    }

    private setupPipeLines() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const renderer = this
        setupPrimitivePipeLine()
        setupTexturePipeline()

        function setupPrimitivePipeLine() {
            renderer.bindGroupLayouts["primitive"] = renderer.device.createBindGroupLayout({
                label: "Primitive Bind Group Layout",
                entries: [
                    {
                        binding: 0,
                        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                        buffer: { type: "uniform" }
                    },
                    {
                        binding: 1,
                        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                        buffer: { type: "uniform" }
                    },
                    {
                        binding: 2,
                        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                        buffer: { type: 'read-only-storage' }
                    },
                    {
                        binding: 3,
                        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                        buffer: { type: "read-only-storage" }
                    }
                ]
            })

            const pipelineLayout = renderer.device.createPipelineLayout({
                label: "Pipeline Layout",
                bindGroupLayouts: [renderer.bindGroupLayouts["primitive"]]
            })
            renderer.pipelines["primitive"] = renderer.device.createRenderPipeline({
                label: "Render Pipeline",
                layout: pipelineLayout,
                vertex: {
                    module: renderer.shaders["primitive"].vert
                },
                fragment: {
                    module: renderer.shaders["primitive"].frag,
                    targets: [{ format: renderer.preferdFormat }]
                }
            })
        }

        function setupTexturePipeline() {
            renderer.bindGroupLayouts["texture"] = renderer.device.createBindGroupLayout({
                label: "Texture Bind Group Layout",
                entries: [
                    {
                        binding: 0,
                        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                        buffer: { type: "uniform" }
                    },
                    {
                        binding: 1,
                        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                        buffer: { type: "uniform" }
                    },
                    {
                        binding: 2,
                        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                        buffer: { type: 'read-only-storage' }
                    },
                    {
                        binding: 3,
                        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                        sampler: {}
                    },
                    {
                        binding: 4,
                        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                        texture: {}
                    },
                    {
                        binding: 5,
                        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                        buffer: { type: 'read-only-storage' }
                    }
                ]
            })

            const pipelineLayout = renderer.device.createPipelineLayout({
                label: "Texture Pipeline Layout",
                bindGroupLayouts: [renderer.bindGroupLayouts["texture"]]
            })

            renderer.pipelines["texture"] = renderer.device.createRenderPipeline({
                label: "Texture Pipeline",
                layout: pipelineLayout,
                vertex: {
                    module: renderer.shaders["texture"].vert
                },
                fragment: {
                    module: renderer.shaders["texture"].frag,
                    targets: [{ format: renderer.preferdFormat }]
                }
            })
        }
    }

    private setupBuffers() {
        this.worldDimensionsBuffer = this.device.createBuffer({
            label: "World Dimension Buffer",
            size: 2 * 4,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        })
        this.device.queue.writeBuffer(this.worldDimensionsBuffer, 0, new Float32Array([WORLD.width, WORLD.height]))

        this.screenDimensionsBuffer = this.device.createBuffer({
            label: "Screen Dimension Buffer",
            size: 2 * 4,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        })

        this.setupObjectsBuffer()
    }

    private setupObjectsBuffer() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const renderer = this
        if (this.objects["primitive"].length) {
            setupPrimitiveObjectsBuffer()
        }

        if (this.objects["texture"].length) {
            setupTextureObjectsBuffer()
        }

        function setupPrimitiveObjectsBuffer() {
            const objectsBufferSize = 2 * 4 * 6 * renderer.objects["primitive"].length
            if (!renderer.objectsBuffer["primitive"] || renderer.objectsBuffer["primitive"].size !== objectsBufferSize) {
                if (renderer.objectsBuffer["primitive"]) {
                    renderer.objectsBuffer["primitive"].destroy()
                }

                renderer.objectsBuffer["primitive"] = renderer.device.createBuffer({
                    label: "Primitive Objects Buffer",
                    size: objectsBufferSize,
                    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE
                })
            }
            renderer.device.queue.writeBuffer(
                renderer.objectsBuffer["primitive"],
                0,
                new Float32Array(renderer.objects["primitive"].map(x => x.getVertices()).flat())
            )

            const propsBufferSize = 4 * 4 * renderer.objects["primitive"].length
            if (!renderer.propsBuffer["primitive"] || renderer.propsBuffer["primitive"].size !== propsBufferSize) {
                if (renderer.propsBuffer["primitive"]) {
                    renderer.propsBuffer["primitive"].destroy()
                }

                renderer.propsBuffer["primitive"] = renderer.device.createBuffer({
                    label: "Props Buffer",
                    size: propsBufferSize,
                    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
                })
            }

            const propsArray = new Float32Array(
                renderer.objects["primitive"].map(x => x.color).flat()
            )
            renderer.device.queue.writeBuffer(renderer.propsBuffer["primitive"], 0, propsArray)
        }

        function setupTextureObjectsBuffer() {
            if (!renderer.sampler) {
                renderer.sampler = renderer.device.createSampler({
                    label: "Texture Sampler",
                    addressModeU: "repeat",
                    addressModeV: "repeat",
                    magFilter: "nearest",
                    minFilter: "nearest",
                })
            }

            for (const obj of renderer.objects["texture"] as ITextureObject[]) {
                obj.texture = renderer.device.createTexture({
                    label: `Texture: ${obj.label}`,
                    format: "rgba8uint",
                    size: [obj.image.width, obj.image.height],
                    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
                })
                renderer.device.queue.copyExternalImageToTexture(
                    { source: obj.image, flipY: true },
                    { texture: obj.texture },
                    { width: obj.image.width, height: obj.image.height }
                )

                const uvs = new Float32Array(obj.getUVs())
                obj.uvsBuffer = renderer.device.createBuffer({
                    label: `Texture UV Buffer: ${obj.label}`,
                    size: uvs.byteLength,
                    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
                })
                renderer.device.queue.writeBuffer(obj.uvsBuffer, 0, uvs)

                const vertices = new Float32Array(obj.getVertices())
                obj.verticesBuffer = renderer.device.createBuffer({
                    label: `Texture Vertex Buffer: ${obj.label}`,
                    size: uvs.byteLength,
                    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
                })
                renderer.device.queue.writeBuffer(obj.verticesBuffer, 0, vertices)
            }
        }
    }

    private getBindGroup(object: IRenderObject) {
        const renderer = this

        switch (object.type) {
            case "primitive":
                return getPrimitiveBindGroup()
            case "texture":
                return getTextureBindGroup()

        }

        function getPrimitiveBindGroup() {
            return renderer.device.createBindGroup({
                label: "Primitive Bind Group",
                layout: renderer.bindGroupLayouts["primitive"],
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: renderer.worldDimensionsBuffer }
                    },
                    {
                        binding: 1,
                        resource: { buffer: renderer.screenDimensionsBuffer }
                    },
                    {
                        binding: 2,
                        resource: { buffer: renderer.objectsBuffer["primitive"] }
                    },
                    {
                        binding: 3,
                        resource: { buffer: renderer.propsBuffer["primitive"] }
                    }
                ]
            })
        }

        function getTextureBindGroup() {
            return renderer.device.createBindGroup({
                label: "Texture Bind Group",
                layout: renderer.bindGroupLayouts["texture"],
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: renderer.worldDimensionsBuffer }
                    },
                    {
                        binding: 1,
                        resource: { buffer: renderer.screenDimensionsBuffer }
                    },
                    {
                        binding: 2,
                        resource: { buffer: (object as ITextureObject).verticesBuffer }
                    },
                    {
                        binding: 3,
                        resource: renderer.sampler,
                    },
                    {
                        binding: 4,
                        resource: (object as ITextureObject).texture.createView(),
                    },
                    {
                        binding: 5,
                        resource: { buffer: (object as ITextureObject).uvsBuffer }
                    }
                ]
            })
        }
    }

    private setupRenderPassDescriptor() {
        this.renderPassDescriptor = {
            label: "Render Pass Descriptor",
            colorAttachments: [
                {
                    loadOp: "clear",
                    storeOp: "store",
                    clearValue: [0, 0, 0, 0],
                    view: this.context.getCurrentTexture().createView()
                }
            ]
        }
    }

    private startAnimation() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const renderer = this
        requestAnimationFrame(animate)
        function animate() {
            renderer.render()
            requestAnimationFrame(animate)
        }
    }

    private render() {
        const canvas = this.context.canvas as HTMLCanvasElement
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        const view = this.context.getCurrentTexture().createView()
        for (const colorAttachments of this.renderPassDescriptor.colorAttachments) {
            colorAttachments.view = view
        }
        this.device.queue.writeBuffer(this.screenDimensionsBuffer, 0, new Float32Array([canvas.width, canvas.height]))

        if (!Object.values(this.objects).flat().length) return

        const encoder = this.device.createCommandEncoder({
            label: "Encoder"
        })
        const pass = encoder.beginRenderPass(this.renderPassDescriptor)

        if (this.objects["primitive"].length) {
            pass.setPipeline(this.pipelines["primitive"])
            pass.setBindGroup(0, this.getBindGroup(this.objects["primitive"][0]))

            pass.draw(6, this.objects["primitive"].length)
        }

        if (this.objects["texture"].length) {
            pass.setPipeline(this.pipelines["texture"])
            for (const obj of this.objects['texture']) {
                pass.setBindGroup(0, this.getBindGroup(obj))
                pass.draw(6)
            }
        }

        pass.end()
        this.device.queue.submit([encoder.finish()])
    }
}