export const uniforms = /*wgsl*/`
    @group(0) @binding(0) var<uniform> worldDimensions: vec2f;
    @group(0) @binding(1) var<uniform> screenDimensions: vec2f;
`

export const mapToClipSpace = /*wgsl*/`
    fn mapToClipSpace(pos: vec2f) -> vec2f {
        return (2 * pos / vec2f(worldDimensions.x, -worldDimensions.y)) + vec2f(-1.,1.);
    }
`

export const basicVertexShader = /*wgsl*/`
    ${uniforms}
    ${mapToClipSpace}

    struct Prop {
        color: vec4f,
    }
    @group(0) @binding(2) var<storage, read> objects: array<array<vec2f, 6>>;
    @group(0) @binding(3) var<storage, read> props: array<Prop>;

    struct VertOut {
        @builtin(position) pos: vec4f,
        @location(0) color: vec4f,
    }

    @vertex
    fn vs(
        @builtin(vertex_index) vertIdx: u32,
        @builtin(instance_index) instIdx: u32
    ) -> VertOut {
        var pos = mapToClipSpace(objects[instIdx][vertIdx]);

        var out:VertOut;
        out.pos = vec4f(pos, 0., 1.);
        out.color = props[instIdx].color;

        return out;
    }
`

export const basicFragmentShader = /*wgsl*/`
    ${uniforms}

    struct VertOut {
        @builtin(position) pos: vec4f,
        @location(0) color: vec4f,
    }

    @fragment
    fn fs(out: VertOut) -> @location(0) vec4f {
        return out.color;
    }
`