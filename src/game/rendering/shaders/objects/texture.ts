import { mapToClipSpace, uniforms } from "../basic";

const shared = /*wgsl*/`
    struct VertOut {
        @builtin(position) pos: vec4f,
        @location(0) texCord: vec2f,
    }

    @group(0) @binding(2) var<storage, read> objects: array<vec2f, 6>;
    @group(0) @binding(3) var inSampler: sampler;
    @group(0) @binding(4) var texture: texture_2d<f32>;
    @group(0) @binding(5) var<storage, read> texCords: array<vec2f,6>;
`

export const TextureVsShader = /*wgsl*/`
    ${uniforms}
    ${mapToClipSpace}
    ${shared}

    @vertex
    fn vs(
        @builtin(vertex_index) vertIdx: u32,
    ) -> VertOut {
        var pos = mapToClipSpace(objects[vertIdx]);

        var out:VertOut;
        out.pos = vec4f(pos, 0.,1.);
        out.texCord = texCords[vertIdx];

        return out;
    }
`

export const TextureFsShader = /*wgsl*/`
    ${uniforms}
    ${shared}

    @fragment
    fn fs(out: VertOut) -> @location(0) vec4f {
        let texCord = out.texCord;
        return textureSample(texture, inSampler, texCord);
    }
`



