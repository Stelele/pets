import { WORLD } from ".."
import { basicFragmentShader, basicVertexShader } from "./shaders/basic"
import { IPrimitiveObject } from "./shaders/objects/types"

export class Renderer {
    private canvas!: HTMLCanvasElement
    private device!: GPUDevice
    private context!: GPUCanvasContext
    private preferdFormat!: GPUTextureFormat

    // objects
    private objects: IPrimitiveObject[] = []

    // shaders
    private vertexShader!: GPUShaderModule
    private fragmentShader!: GPUShaderModule

    // buffers
    private worldDimensionsBuffer!: GPUBuffer
    private screenDimensionsBuffer!: GPUBuffer
    private objectsBuffer!: GPUBuffer
    private propsBuffer!: GPUBuffer

    // pipeline
    private bindGroup!: GPUBindGroup
    private bindGroupLayout!: GPUBindGroupLayout
    private pipeline!: GPURenderPipeline

    // rendering
    private renderPassDescriptor!: GPURenderPassDescriptor

    public async init(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        })
        await this.initDevice()
        this.loadShaders()

        if (this.objects.length) {
            this.setupPipeline()
            this.setupBuffers()
            this.setupBindGroup()
        }

        this.setupRenderPassDescriptor()
        this.startAnimation()
    }

    public addObjects(objects: IPrimitiveObject[]) {
        this.objects = objects
        this.setupPipeline()
        this.setupBuffers()
        this.setupBindGroup()
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

    private loadShaders() {
        this.vertexShader = this.device.createShaderModule({
            label: "Vertex Shader",
            code: basicVertexShader
        })

        this.fragmentShader = this.device.createShaderModule({
            label: "Fragment Shader",
            code: basicFragmentShader,
        })
    }

    private setupPipeline() {
        this.bindGroupLayout = this.device.createBindGroupLayout({
            label: "Bind Group Layout",
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

        const pipelineLayout = this.device.createPipelineLayout({
            label: "Pipeline Layout",
            bindGroupLayouts: [this.bindGroupLayout]
        })
        this.pipeline = this.device.createRenderPipeline({
            label: "Render Pipeline",
            layout: pipelineLayout,
            vertex: {
                module: this.vertexShader
            },
            fragment: {
                module: this.fragmentShader,
                targets: [{ format: this.preferdFormat }]
            }
        })
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
        this.setupPropsBuffer()
    }

    private setupObjectsBuffer() {
        const bufferSize = 2 * 4 * 6 * this.objects.length
        if (!this.objectsBuffer || this.objectsBuffer.size !== bufferSize) {
            if (this.objectsBuffer) {
                this.objectsBuffer.destroy()
            }

            this.objectsBuffer = this.device.createBuffer({
                label: "Objects Buffer",
                size: bufferSize,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE
            })
        }
        this.device.queue.writeBuffer(this.objectsBuffer, 0, new Float32Array(this.objects.map(x => x.getVertices()).flat()))
    }

    private setupPropsBuffer() {
        const propSize = 4 * 4 + 4 * 4
        const bufferSize = propSize * this.objects.length
        if (!this.propsBuffer || this.propsBuffer.size !== bufferSize) {
            if (this.propsBuffer) {
                this.propsBuffer.destroy()
            }

            this.propsBuffer = this.device.createBuffer({
                label: "Props Buffer",
                size: bufferSize,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
            })
        }

        const dataArray = new ArrayBuffer(this.propsBuffer.size)
        for (let i = 0; i < this.objects.length; i++) {
            const colorsData = new Float32Array(dataArray, propSize * i)
            const typeData = new Uint32Array(dataArray, colorsData.byteOffset + 4 * 4)

            colorsData[0] = this.objects[i].color[0]
            colorsData[1] = this.objects[i].color[1]
            colorsData[2] = this.objects[i].color[2]
            colorsData[3] = this.objects[i].color[3]

            typeData[0] = this.objects[i].type
        }
        this.device.queue.writeBuffer(this.propsBuffer, 0, dataArray)
    }

    private setupBindGroup() {
        this.bindGroup = this.device.createBindGroup({
            label: "Bind Group",
            layout: this.bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: { buffer: this.worldDimensionsBuffer }
                },
                {
                    binding: 1,
                    resource: { buffer: this.screenDimensionsBuffer }
                },
                {
                    binding: 2,
                    resource: { buffer: this.objectsBuffer }
                },
                {
                    binding: 3,
                    resource: { buffer: this.propsBuffer }
                }
            ]
        })
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

        if (!this.objects.length) return

        const encoder = this.device.createCommandEncoder({
            label: "Encoder"
        })
        const pass = encoder.beginRenderPass(this.renderPassDescriptor)

        pass.setPipeline(this.pipeline)
        pass.setBindGroup(0, this.bindGroup)

        pass.draw(6, this.objects.length)

        pass.end()
        this.device.queue.submit([encoder.finish()])
    }
}