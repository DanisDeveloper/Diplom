export default `precision highp float;

// Uniforms matching Shadertoy
uniform float iTime;
uniform vec2 iResolution;
uniform vec3 iMouse;
uniform float deltaTime;
uniform int iFrame;


// Forward declarations
vec2 march(vec3 pos, vec3 dir);
vec3 camera(vec2 uv);
float scene(vec3 p);
vec2 modA(vec2 p, float count);

// Config flags
#define LIGHT
//#define HOLES
//#define FUNKY

// Constants
#define I_MAX 200.0
#define E     0.0001
#define FAR   50.0
#define PI    3.14159
#define TAU   (PI * 2.0)

// Globals
float t_global;
vec3 ret_col;
#ifdef LIGHT
vec3 h_light;
#endif

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 R = iResolution;
    vec2 uv = (fragCoord - 0.5 * R) / R.y;

    t_global = iTime * 0.125;
    vec3 dir = camera(uv);
    vec3 pos = vec3(0.0, 0.0, 4.5 - iTime * 2.0);

    #ifdef LIGHT
    h_light = vec3(0.0);
    #endif

    vec2 inter = march(pos, dir);
    vec3 col = vec3(0.0);
    if (inter.y <= FAR) {
        col = ret_col * (1.0 - inter.x * 0.0025);
    }
    #ifdef LIGHT
    col += h_light * 0.005125;
    #endif

    gl_FragColor = vec4(col, 1.0);
}

vec2 modA(vec2 p, float count) {
    float an = TAU / count;
    float a = atan(p.y, p.x) + an * 0.5;
    a = mod(a, an) - an * 0.5;
    return vec2(cos(a), sin(a)) * length(p);
}

float scene(vec3 p) {
    float var;
    float mind;
    vec3 op = p;

    #ifdef FUNKY
    var = step(-1.0 + cos(floor(p.z * 6.0) / 6.0 + iTime) * PI,
               mod(atan(p.x, p.y), TAU) - PI)
        * step(mod(atan(p.x, p.y), TAU) - PI - 1.5,
               -1.0 + cos(floor(p.z * 3.0) + iTime) * PI)
        * step(0.0,
               (length(fract(vec2(op.z,
                                   min(abs(op.x), abs(op.y))) * 10.0) - 0.5)
                - 0.2));
    #else
    var = atan(p.x, p.y);
    #endif

    var = cos(var + floor(p.z) + iTime * (mod(floor(p.z), 2.0) - 1.0));
    ret_col = 1.0 - vec3(0.5 - var * 0.5, 0.5, 0.3 + var * 0.5);

    mind = length(p.xy) - 1.0 + 0.1 * var;
    #ifdef HOLES
    mind = max(mind,
               var * -(length(fract(vec2(op.z,
                                          min(abs(op.x), abs(op.y))) * 10.0)
                               - 0.5)
                       - 0.1));
    #endif
    mind = max(mind, -(length(p.xy) - 0.9 + 0.1 * var));

    p.xy = modA(p.yx, 50.0 + 50.0 * sin(p.z * 0.25));
    p.z = fract(p.z * 3.0) - 0.5;

    float dist_cyl = length(p.zy) - 0.0251 - 0.25 * sin(op.z * 5.5);
    dist_cyl = max(dist_cyl, -p.x + 0.4 + clamp(var, 0.0, 1.0));
    mind = min(mind, dist_cyl);

    #ifdef LIGHT
    h_light += vec3(0.5, 0.8, 0.5) * step(var, 0.0) * 0.0125 /
               (0.01 + pow(mind - var * 0.1, 2.0));
    #endif
    return mind;
}

vec2 march(vec3 pos, vec3 dir) {
    vec2 dist = vec2(0.0);
    vec3 p;
    vec2 s = vec2(0.0);
    for (float i = -1.0; i < I_MAX; i += 1.0) {
        p = pos + dir * dist.y;
        dist.x = scene(p);
        dist.y += dist.x * 0.2;
        if (dist.x < E || dist.y > FAR) break;
        s.x += 1.0;
    }
    s.y = dist.y;
    return s;
}

vec3 camera(vec2 uv) {
    float fov = 1.0;
    vec3 forw  = vec3(0.0, 0.0, -1.0);
    vec3 right = vec3(1.0, 0.0, 0.0);
    vec3 up    = vec3(0.0, 1.0, 0.0);
    return normalize(uv.x * right + uv.y * up + fov * forw);
}
`