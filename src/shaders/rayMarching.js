export default `precision mediump float;

uniform float iTime;
uniform vec2 iResolution;
uniform vec3 iMouse;
uniform float deltaTime;
uniform int iFrame;

float sceneSDF(vec3 p) {
    // Анимированная позиция сферы с использованием времени
    vec3 spherePos = vec3(sin(iTime)*0.5, cos(iTime*0.7)*0.3, 0.0);
    
    return length(p - spherePos) - 0.3;
}

float rayMarch(vec3 ro, vec3 rd, float maxDist) {
    const int MAX_STEPS = 100; // Фиксированное количество шагов
    float t = 0.0;
    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + t * rd;
        float d = sceneSDF(p);
        if (d < 0.001) return t;
        t += d;
        if (t >= maxDist) break;
    }
    return -1.0;
}

vec3 computeNormal(vec3 p) {
    float eps = 0.001;
    float d = sceneSDF(p);
    return normalize(vec3(
        sceneSDF(p + vec3(eps, 0, 0)) - d,
        sceneSDF(p + vec3(0, eps, 0)) - d,
        sceneSDF(p + vec3(0, 0, eps)) - d
    ));
}

void main() {
    // Нормализация координат экрана
    vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / iResolution.y;
    
    // Параметры камеры
    vec3 rayOrigin = vec3(0.0, 0.0, 2.0);
    vec3 rayDir = normalize(vec3(uv, -1.5));
    
    // Трассировка лучей
    float hit = rayMarch(rayOrigin, rayDir, 20.0);    
  
    // Цвет фона (градиент)
    vec3 color = vec3(0.3, 0.4, 0.6) * (1.0 - 0.2*length(uv));
    
    if (hit > 0.0) {
        vec3 pos = rayOrigin + rayDir * hit;
        vec3 normal = computeNormal(pos);
        
        // Освещение
        vec3 lightPos = vec3(2.0, 2.0, 2.0);
        vec3 lightDir = normalize(lightPos - pos);
        float diffuse = max(dot(normal, lightDir), 0.1);
        
        // Цвет материала с учетом освещения
        color = vec3(0.8, 0.5, 0.2) * diffuse;
        
        // Ambient свет
        color += vec3(0.1, 0.15, 0.2);
        
        // Затемнение по расстоянию
        color *= 1.0 / (1.0 + hit*0.2);
    }
    
    gl_FragColor = vec4(color, 1.0);
}`