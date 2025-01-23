export const uniforms = /*wgsl*/`
    @group(0) @binding(0) var<uniform> worldDimensions: vec2f;
    @group(0) @binding(1) var<uniform> screenDimensions: vec2f;
    @group(0) @binding(2) var<storage, read> objects: array<array<vec2f, 6>>;

    struct Prop {
        color: vec4f,
        objType: u32,
    };
    @group(0) @binding(3) var<storage, read> props: array<Prop>;

    struct VertOut {
        @builtin(position) pos: vec4f,
        @location(0) color: vec4f,
        @location(1) @interpolate(flat) objType: u32,
    }
`

export const basicVertexShader = /*wgsl*/`
    ${uniforms}

    @vertex
    fn vs(
        @builtin(vertex_index) vertIdx: u32,
        @builtin(instance_index) instIdx: u32
    ) -> VertOut {
        var pos = (2 * objects[instIdx][vertIdx] / vec2f(worldDimensions.x, -worldDimensions.y)) + vec2f(-1.,1.);

        var out:VertOut;
        out.pos = vec4f(pos, 0., 1.);
        out.color = props[instIdx].color;
        out.objType = props[instIdx].objType;

        return out;
    }
`

export const basicFragmentShader = /*wgsl*/`
    ${uniforms}

    @fragment
    fn fs(out: VertOut) -> @location(0) vec4f {
        switch  out.objType {
            case 0 {
                return out.color;
            }
            default {
                return out.color;
            }
        }
    }
`