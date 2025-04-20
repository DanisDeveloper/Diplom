export default `precision mediump float;

// Uniforms from the host environment
uniform float iTime;      // Time in seconds since the simulation started
uniform vec2 iResolution; // Screen resolution (width, height)
uniform vec3 iMouse;      // Mouse coords (x, y) + click flag
uniform float deltaTime;  // Time between frames (in seconds)
uniform int iFrame;       // Frame number of the simulation

// Antialiasing level (tweak as needed)
#define AA 2

// Orbit trap data
vec4 orb;

// Distance estimator for the fractal
float map(vec3 p, float s) {
    float scale = 1.0;
    orb = vec4(1000.0);
    
    for (int i = 0; i < 8; i++) {
        p = -1.0 + 2.0 * fract(0.5 * p + 0.5);
        float r2 = dot(p, p);
        orb = min(orb, vec4(abs(p), r2));
        float k = s / r2;
        p *= k;
        scale *= k;
    }
    
    return 0.25 * abs(p.y) / scale;
}

// Ray marching
float trace(in vec3 ro, in vec3 rd, float s) {
    float maxd = 30.0;
    float t = 0.01;
    for (int i = 0; i < 512; i++) {
        float precis = 0.001 * t;
        float h = map(ro + rd * t, s);
        if (h < precis || t > maxd) break;
        t += h;
    }
    if (t > maxd) t = -1.0;
    return t;
}

// Normal computation via finite differences
vec3 calcNormal(in vec3 pos, in float t, in float s) {
    float precis = 0.001 * t;
    vec2 e = vec2(1.0, -1.0) * precis;
    return normalize(
        e.xyy * map(pos + e.xyy, s) +
        e.yyx * map(pos + e.yyx, s) +
        e.yxy * map(pos + e.yxy, s) +
        e.xxx * map(pos + e.xxx, s)
    );
}

// Rendering routine: shading and coloring
vec3 render(in vec3 ro, in vec3 rd, in float anim) {
    vec3 col = vec3(0.0);
    float t = trace(ro, rd, anim);
    if (t > 0.0) {
        vec4 tra = orb;
        vec3 pos = ro + t * rd;
        vec3 nor = calcNormal(pos, t, anim);

        // Lighting
        vec3 light1 = vec3( 0.577, 0.577, -0.577 );
        vec3 light2 = vec3(-0.707, 0.0,   0.707 );
        float key = clamp(dot(light1, nor), 0.0, 1.0);
        float bac = clamp(0.2 + 0.8 * dot(light2, nor), 0.0, 1.0);
        float amb = (0.7 + 0.3 * nor.y);
        float ao  = pow(clamp(tra.w * 2.0, 0.0, 1.0), 1.2);

        vec3 brdf  = vec3(0.40) * amb * ao;
        brdf += vec3(1.00) * key * ao;
        brdf += vec3(0.40) * bac * ao;

        // Material coloring
        vec3 rgb = vec3(1.0);
        rgb = mix(rgb, vec3(1.0, 0.80, 0.2), clamp(6.0 * tra.y, 0.0, 1.0));
        rgb = mix(rgb, vec3(1.0, 0.55, 0.0), pow(clamp(1.0 - 2.0 * tra.z, 0.0, 1.0), 8.0));

        // Final color with distance fading
        col = rgb * brdf * exp(-0.2 * t);
    }
    return sqrt(col);
}

// MainImage function ported from Shadertoy
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    float time = iTime * 0.25;
    float anim = 1.1 + 0.5 * smoothstep(-0.3, 0.3, cos(0.1 * iTime));

    vec3 tot = vec3(0.0);

    #if AA > 1
    for (int jj = 0; jj < AA; jj++)
    for (int ii = 0; ii < AA; ii++) {
    #else
    int ii = 1;
    int jj = 1;
    #endif
        vec2 q = fragCoord + vec2(float(ii), float(jj)) / float(AA);
        vec2 p = (2.0 * q - iResolution.xy) / iResolution.y;

        // Camera setup
        vec3 ro   = vec3(2.8 * cos(0.1 + 0.33 * time), 0.4 + 0.30 * cos(0.37 * time), 2.8 * cos(0.5 + 0.35 * time));
        vec3 ta   = vec3(1.9 * cos(1.2 + 0.41 * time), 0.4 + 0.10 * cos(0.27 * time), 1.9 * cos(2.0 + 0.38 * time));
        float roll = 0.2 * cos(0.1 * time);
        vec3 cw   = normalize(ta - ro);
        vec3 cp   = vec3(sin(roll), cos(roll), 0.0);
        vec3 cu   = normalize(cross(cw, cp));
        vec3 cv   = normalize(cross(cu, cw));
        vec3 rd   = normalize(p.x * cu + p.y * cv + 2.0 * cw);

        tot += render(ro, rd, anim);
    #if AA > 1
    }
    #endif

    tot = tot / float(AA * AA);
    fragColor = vec4(tot, 1.0);
}

// Entry point adapting Shadertoy's mainImage
void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec4 fragColor;
    mainImage(fragColor, fragCoord);
    gl_FragColor = fragColor;
}`