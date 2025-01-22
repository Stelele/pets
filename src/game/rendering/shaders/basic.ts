export const uniforms = /*wgsl*/`
    @group(0) @binding(0) var<uniform> worldDimensions: vec2f;
    @group(0) @binding(1) var<uniform> screenDimensions: vec2f;
    @group(0) @binding(2) var<storage, read> objects: array<array<vec2f, 6>>;
`

export const basicVertexShader = /*wgsl*/`
    ${uniforms}

    @vertex
    fn vs(
        @builtin(vertex_index) vertIdx: u32,
        @builtin(instance_index) instIdx: u32
    ) -> @builtin(position) vec4f {
        var pos = (2 * objects[instIdx][vertIdx] / vec2f(worldDimensions.x, -worldDimensions.y)) + vec2f(-1.,1.);

        return vec4f(pos, 0., 1.);
    }
`

export const basicFragmentShader = /*wgsl*/`
    ${uniforms}

    @fragment
    fn fs() -> @location(0) vec4f {
        return vec4f(1., 0., 0., 1.);
    }
`