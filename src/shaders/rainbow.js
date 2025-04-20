export default `precision mediump float;

uniform float iTime;      // Время в секундах с начала симуляции
uniform vec2  iResolution; // Разрешение экрана (ширина, высота)
uniform vec3  iMouse;      // Координаты мыши (x, y) + флаг нажатия
uniform float deltaTime;   // Время между кадрами (в секундах)
uniform int   iFrame;      // Номер кадра симуляции

void main() {
    vec2 F = gl_FragCoord.xy;
    vec2 r = iResolution.xy;

    // Выходной цвет (RGBA)
    vec4 O = vec4(0.0);

    // Локальные переменные из оригинала
    float l, t = iTime;

    // Вычисляем начальную длину
    float tmp = (F += F - r).x; // просто чтобы F изменился аналогично Shadertoy
    l = length(F / r.y) + 0.3;

    // Основной цикл рендеринга спирали
    for (float i = 0.3; i < 12.0; i++) {
        O += length(min(r.y / abs(F), r)) / 3e2 
             * (cos(++t + i + vec4(0.0, 1.0, 2.0, 0.0)) * l + l);
        F *= mat2(cos(l * 0.2 - i * --t / 100.0 + vec4(0.0, 33.0, 11.0, 0.0)));
    }

    // Принудительно делаем альфу равной 1
    gl_FragColor = vec4(O.rgb, 1.0);
}
`