export default `precision mediump float;

uniform float iTime;
uniform vec2 iResolution;
uniform vec3 iMouse;
uniform float deltaTime;
uniform int iFrame;

void main() {
    // Центрированные координаты в диапазоне [-1, 1], с поправкой на соотношение сторон
    vec2 uv = gl_FragCoord.xy / iResolution.xy * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    // Цветовая палитра зависит от времени
    vec3 color = vec3(0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0.0, 2.0, 4.0)));

    gl_FragColor = vec4(color, 1.0);
}
`