export default `#extension GL_OES_standard_derivatives : enable
precision mediump float;

uniform float iTime;
uniform vec2 iResolution;
uniform vec3 iMouse;
uniform float deltaTime;
uniform int iFrame;

vec2 hash22(vec2 p) {
    float n = sin(dot(p, vec2(41.0, 289.0)));
    p = fract(vec2(262144.0, 32768.0) * n);
    return sin(p * 6.2831853 + iTime) * 0.35 + 0.65;
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float Voronoi(in vec2 p) {
    vec2 g = floor(p), o;
    p -= g;

    vec3 d = vec3(1.0);
    float r = 0.0;

    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
            o = vec2(float(x), float(y));
            o += hash22(g + o) - p;
            r = dot(o, o);

            d.z = max(d.x, max(d.y, min(d.z, r)));
            d.y = max(d.x, min(d.y, r));
            d.x = min(d.x, r);
        }
    }

    d = sqrt(d);
    return min(2.0 / (1.0 / max(d.y - d.x, 0.001) + 1.0 / max(d.z - d.x, 0.001)), 1.0);
}

vec2 hMap(vec2 uv) {
    float h = Voronoi(uv * 6.0);
    float c = smoothstep(0.0, fwidth(h) * 2.0, h - 0.09) * h;
    c += (1.0 - smoothstep(0.0, fwidth(h) * 3.0, h - 0.22)) * c * 0.5;
    return vec2(c, h);
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = fragCoord / iResolution.y + vec2(-0.1, 0.025) * iTime;

    vec2 c = hMap(uv);
    vec2 c2 = hMap(uv + 0.004);

    float b = max(c2.x - c.x, 0.0) * 16.0;

    vec3 col = vec3(1.0, 0.05, 0.25) * c.x;
    float sv = Voronoi(uv * 16.0 + c.y) * 0.66 + (1.0 - Voronoi(uv * 48.0 + c.y * 2.0)) * 0.34;
    col = col * 0.85 + vec3(1.0, 0.7, 0.5) * sv * sqrt(sv) * 0.3;
    col += (1.0 - col) * (1.0 - smoothstep(0.0, fwidth(c.y) * 3.0, c.y - 0.22)) * c.x;
    col *= col;

    sv = col.x * Voronoi(uv * 6.0 + 0.5);
    col += vec3(0.7, 1.0, 0.3) * pow(sv, 4.0) * 8.0;

    col += vec3(0.5, 0.7, 1.0) * (b * b * 0.5 + b * b * b * b * 0.5);

    gl_FragColor = vec4(sqrt(clamp(col, 0.0, 1.0)), 1.0);
}
`