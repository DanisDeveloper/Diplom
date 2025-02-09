export default `precision mediump float;

uniform float iTime;      // Время в секундах с начала симуляции
uniform vec2 iResolution; // Разрешение экрана (ширина, высота)
uniform vec3 iMouse;      // Координаты мыши (x, y) + флаг нажатия
uniform float deltaTime;  // Время между кадрами (в секундах)
uniform int iFrame;       // Номер кадра симуляции


void main() {
  vec2 uv = (gl_FragCoord.xy / iResolution * 2.0 - 1.0); 
  uv.x *= iResolution.x / iResolution.y  
  gl_FragColor = vec4(uv, 0.0, 1.0);
}
`