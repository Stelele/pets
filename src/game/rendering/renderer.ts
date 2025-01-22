import { WORLD } from ".."
import { basicFragmentShader, basicVertexShader } from "./shaders/basic"

export class Renderer {
    private canvas!: HTMLCanvasElement
    private device!: GPUDevice
    private context!: GPUCanvasContext
    private preferdFormat!: GPUTextureFormat

    // objects
    private objects: number[][] = [
        [
            WORLD.width / 4, WORLD.height / 4,
            WORLD.width / 4, 3 * WORLD.height / 4,
            3 * WORLD.width / 4, WORLD.height / 4,
            3 * WORLD.width / 4, WORLD.height / 4,
            WORLD.width / 4, 3 * WORLD.height / 4,
            3 * WORLD.width / 4, 3 * WORLD.height / 4
        ]
    ]

    // shaders
    private vertexShader!: GPUShaderModule
    private fragmentShader!: GPUShaderModule

    // buffers
    private worldDimensionsBuffer!: GPUBuffer
    private screenDimensionsBuffer!: GPUBuffer
    private objectsBuffer!: GPUBuffer

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
        this.setupPipeline()
        this.setupBuffers()
        this.setupBindGroup()
        this.setupRenderPassDescriptor()
        this.startAnimation()
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
    }

    private setupObjectsBuffer() {
        const bufferSize = 2 * 4 * 6 * this.objects.length
        if (this.objectsBuffer && this.objectsBuffer.size === bufferSize) return
        if (this.objectsBuffer) {
            this.objectsBuffer.destroy()
        }

        this.objectsBuffer = this.device.createBuffer({
            label: "Objects Buffer",
            size: bufferSize,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE
        })
        this.device.queue.writeBuffer(this.objectsBuffer, 0, new Float32Array(this.objects.flat()))
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