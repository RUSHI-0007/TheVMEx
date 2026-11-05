// Liquid-Gold Displacement Fragment Shader
// Transitions between chapter textures with fBm curl noise & molten gold burn edge.

uniform float uTime;
uniform float uProgress;      // 0.0 -> 1.0 transition progress
uniform vec2 uResolution;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform vec3 uGoldColor;      // Gold light tint (vec3(0.89, 0.77, 0.54))

varying vec2 vUv;

// 2D Hash function
vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

// 2D Gradient Noise
float snoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
            dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
        mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
            dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
        u.y
    );
}

// Fractional Brownian Motion (4 octaves)
float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.55), sin(0.55), -sin(0.55), cos(0.55));
    for (int i = 0; i < 4; i++) {
        v += a * snoise(p);
        p = rot * p * 2.05 + vec2(0.12, 0.24);
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = vUv;

    // Organic liquid flow field
    float n1 = fbm(uv * 3.5 + vec2(uTime * 0.12, uTime * 0.08));
    float n2 = fbm(uv * 5.0 - vec2(uTime * 0.09, uTime * 0.14));
    vec2 flow = vec2(n1, n2) * 0.35;

    // Distortion intensity peaks mid-transition
    float wave = sin(uProgress * 3.14159265);
    vec2 uv1 = uv + flow * wave * (1.0 - uProgress);
    vec2 uv2 = uv - flow * wave * uProgress;

    vec4 tex1 = texture2D(uTexture1, clamp(uv1, 0.0, 1.0));
    vec4 tex2 = texture2D(uTexture2, clamp(uv2, 0.0, 1.0));

    // Dynamic threshold driven by diagonal wipe + noise
    float threshold = (uv.x * 0.4 + uv.y * 0.6) + n1 * 0.35;
    float split = smoothstep(uProgress - 0.12, uProgress + 0.12, threshold);

    vec4 blended = mix(tex2, tex1, split);

    // Liquid gold molten flare along the transition wavefront
    float distToFront = abs(threshold - uProgress);
    float goldBand = 1.0 - smoothstep(0.0, 0.09, distToFront);
    vec3 goldFlare = uGoldColor * goldBand * wave * 2.2;

    // Subtle edge luminescence
    float specular = pow(max(0.0, n2), 3.0) * goldBand * wave * 1.5;

    gl_FragColor = vec4(blended.rgb + goldFlare + vec3(specular), 1.0);
}

