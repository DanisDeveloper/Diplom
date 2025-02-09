export default `precision mediump float;

uniform float iTime;      // Время в секундах с начала симуляции
uniform vec2 iResolution; // Разрешение экрана (ширина, высота)
uniform vec3 iMouse;      // Координаты мыши (x, y) + флаг нажатия
uniform float deltaTime;  // Время между кадрами (в секундах)
uniform int iFrame;       // Номер кадра симуляции

#define OUTER_LOOP 50.0  // внешний цикл (raymarch)
#define INNER_LOOP 5.0   // внутренний цикл (в функции map)
#define T (iTime * 5.0)
#define A(v) mat2(cos(m.v * 3.1416 + vec4(0.0, -1.5708, 1.5708, 0.0)))
#define H(v) (cos(((v) + 0.5) * 6.2832 + radians(vec3(60.0, 0.0, -60.0))) * 0.5 + 0.5)

// Функция округления: аналог round(x)
float myRound(float x) {
  return floor(x + 0.5);
}

float map(vec3 u) {
  float t = T;
  float w = 40.0;  // размер «искажения» по z
  float s = 0.4;   // максимальный размер объекта
  float f = 1e20;  // начальное значение расстояния

  // Преобразования координат
  u.yz = -u.zy;
  u.xy = vec2(atan(u.x, u.y), length(u.xy));
  u.x += t / 6.0;

  vec3 p;
  for (float i = 0.0; i < INNER_LOOP; i++) {
    p = u;
    // Сегментация по оси y с округлением до ближайшего целого:
    float y = myRound(max(p.y - i, 0.0) / INNER_LOOP) * INNER_LOOP + i;
    p.x *= y;                            // масштабирование x с учётом y
    p.x -= sqrt(y * t * t * 2.0);          // смещение x
    p.x -= myRound(p.x / 6.2832) * 6.2832;  // сегментация по x
    p.y -= y;                            // смещение y
    p.z += sqrt(y / w) * w;               // искривление по z
    float z = cos(y * t / 50.0) * 0.5 + 0.5;  // радиальная волна
    p.z += z * 2.0;                       // волновое смещение по z
    p = abs(p);
    f = min(f, max(p.x, max(p.y, p.z)) - s * z); // формирование кубов
  }

  return f;
}

void main() {
  vec2 U = gl_FragCoord.xy;
  vec2 R = iResolution.xy;
  // Если мышь нажата, используем её координаты, иначе значение по умолчанию
  vec2 m = iMouse.z > 0.0 ? (iMouse.xy - R / 2.0) / R.y : vec2(0.0, -0.17);

  float d = 0.0;  // дистанция по лучу
  float s;        // расстояние до поверхности на текущем шаге
  float r;        // параметр для градиента цвета
  vec3 o = vec3(0.0, 20.0, -120.0);  // положение камеры
  vec3 u = normalize(vec3(U - R / 2.0, R.y));  // направление луча
  vec3 c = vec3(0.0);  // итоговый цвет
  vec3 p;

  // Повороты камеры (используем координаты мыши):
  mat2 v = A(y);  // вращение по вертикали (pitch)
  mat2 h = A(x);  // вращение по горизонтали (yaw)

  for (float i = 0.0; i < OUTER_LOOP; i++) {
    p = u * d + o;
    p.yz *= v;
    p.xz *= h;
    s = map(p);
    r = (cos(myRound(length(p.xz)) * T / 50.0) * 0.7 - 1.8) / 2.0;
    c += min(s, exp(-s / 0.07)) * H(r + 0.5) * (r + 2.4);
    if (s < 1e-3 || d > 1e3) break;
    d += s * 0.7;
  }

  // Применяем гамма-коррекцию
  gl_FragColor = vec4(exp(log(c) / 2.2), 1.0);
}
`