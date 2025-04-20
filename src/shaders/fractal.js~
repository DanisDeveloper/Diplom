export default `#ifdef GL_ES
precision highp float;
#endif

uniform float iTime;
uniform vec2  iResolution;

void main() {
    // нормализуем координаты (центр экрана в (0,0))
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
    vec3 color = vec3(0.0);
    vec2 p = uv;

    // основной цикл
    for (float n = 0.0; n < 24.0; n += 1.0) {
        // чуть медленнее затухание, чтобы дальние слои вносили больше цвета
        float attenuation = 1.0 / (1.0 + n * 0.15);

        // полярные координаты
        float radius = length(p) + 1e-5;
        float angle  = atan(p.y, p.x);
        vec2  polar  = vec2(log(radius), angle);
        p = fract((polar - iTime * 0.1) / 2.094) - 0.5;

        float currentN = n + 1.0;
        // три канала сразу
        vec3 wave  = sin(vec3(0.0, 2.0, 4.0) + iTime + currentN * 0.3) + 1.0;
        vec3 wave2 = cos(vec3(0.0, 2.0, 4.0) + iTime + currentN * 0.3) + 1.0;

        // защитные эпсилоны
        float dx = max(0.25 - p.x*p.x, 0.005);
        float dy = max(0.25 - p.y*p.y, 0.005);

        // увеличили коэффициент с 0.0005→0.001
        color += 0.001 / dx * wave  * attenuation
               + 0.001 / dy * wave2 * attenuation;
    }

    // гамма‑коррекция
    color = pow(color, vec3(0.4545));

    // дополнительный «буст» насыщенности через LERP с яркостью
    float lum = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(lum), color, 1.6);  // 1.0 → исходный, 2.0 → макс. насыщенность

    gl_FragColor = vec4(color, 1.0);
}
`