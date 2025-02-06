<template>
  <div class="app">
    <nav-bar></nav-bar>
    <div class="main">
      <shader-window :code></shader-window>
      <code-area v-model="code"></code-area>
    </div>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import ShaderWindow from "@/components/ShaderWindow.vue";
import CodeArea from "@/components/CodeArea.vue";

export default {
  components: {CodeArea, ShaderWindow, NavBar},
  data() {
    return {

      code: `    precision mediump float;
    uniform float iTime;
    uniform vec2 iResolution;
    uniform vec3 iMouse;

    #define T (iTime * 5.0)
    #define A(v) mat2(cos(m.v * 3.1416 + vec4(0.0, -1.5708, 1.5708, 0.0)))
    #define H(v) (cos(((v) + 0.5) * 6.2832 + radians(vec3(60.0, 0.0, -60.0))) * 0.5 + 0.5)
    #define L 50.0 // Loop count must be a constant in WebGL

    float map(vec3 u) {
        float t = T;
        float w = 40.0;
        float s = 0.4;
        float f = 1e20;

        u.yz = -u.zy;
        u.xy = vec2(atan(u.x, u.y), length(u.xy));
        u.x += t / 6.0;

        vec3 p;
        for (float i = 0.0; i < L; i++) {
            p = u;
            float y = floor(max(p.y - i, 0.0) / L) * L + i;
            p.x *= y;
            p.x -= sqrt(y * t * t * 2.0);
            p.x -= floor(p.x / 6.2832) * 6.2832;
            p.y -= y;
            p.z += sqrt(y / w) * w;
            float z = cos(y * t / 50.0) * 0.5 + 0.5;
            p.z += z * 2.0;
            p = abs(p);
            f = min(f, max(p.x, max(p.y, p.z)) - s * z);
        }
        return f;
    }

    void main() {
        vec2 U = gl_FragCoord.xy;
        float d = 0.0, s, r;
        vec2 R = iResolution.xy;
        vec2 m = iMouse.z > 0.0 ? (iMouse.xy - R / 2.0) / R.y : vec2(0.0, -0.17);
        vec3 o = vec3(0.0, 20.0, -120.0);
        vec3 u = normalize(vec3(U - R / 2.0, R.y));
        vec3 c = vec3(0.0), p;
        mat2 v = A(y), h = A(x);

        for (float i = 0.0; i < L; i++) {
            p = u * d + o;
            p.yz *= v;
            p.xz *= h;
            s = map(p);
            r = (cos(floor(length(p.xz)) * T / 50.0) * 0.7 - 1.8) / 2.0;
            c += min(s, exp(-s / 0.07)) * H(r + 0.5) * (r + 2.4);
            if (s < 1e-3 || d > 1e3) break;
            d += s * 0.7;
        }
        gl_FragColor = vec4(exp(log(c) / 2.2), 1.0);
    }
`
    }
  },
}
</script>

<style>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  display: flex;
  flex-direction: column;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Crect width='10' height='10' fill='%23f0f0f0'/%3E%3Cpath d='M0 0h10v10H0z' fill='none' stroke='%23dcdcdc' stroke-width='0.5'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: auto; /* Оригинальный размер */

}

.main {
  display: flex;
  justify-content: space-between;
}


table {
  border-collapse: collapse;
  border: 1px solid black;
}

th, tr, td {
  padding: 10px;
  border: 1px solid black;
}
</style>