<template>
  <div class="shader-window">
    <canvas ref="canvas"
            @mousemove="handleMousemoveEvent"
            @mousedown="handleMousedownEvent"
            @mouseup="handleMouseupEvent"
    >
    </canvas>
    <div class="under-canvas">
      <div class="info-wrapper">
        <div class="info">Frame: {{ frame }}</div>
        <div class="info">Time: {{ accumulatedTime.toFixed(2) }}</div>
        <div class="info">Resolution: {{ canvasWidth }}x{{ canvasHeight }}</div>
      </div>
      <hr>
      <div class="btns">
        <button class="btn" @click="updateShader">Update</button>
        <button class="btn" @click="togglePause">{{ isPaused ? "Continue" : "Stop" }}</button>
        <button class="btn" @click="resetTime">Reset</button>
      </div>
    </div>
  </div>
</template>

<script>
import vertexShaderCode from "@/shaders/vertex.js";

export default {
  props: {
    code: {
      type: String,
      required: true,
      default: "",
    }
  },
  data() {
    return {
      // Переменные WebGL
      gl: null,
      program: null,

      // Переменные мыши
      mouseX: 0,
      mouseY: 0,
      mouseDown: 0,

      // Переменные для таймера
      isPaused: false,       // Флаг паузы
      lastFrameTime: 0,      // Время, зафиксированное в предыдущем кадре (в мс)
      accumulatedTime: 0,    // Накопленное время в секундах (отсчёт, начиная с нуля)

      requestId: null,       // ID requestAnimationFrame

      frame: 0, // Количество кадров, прошедших с начала симуляции

      canvasWidth: 0,
      canvasHeight: 0,
    };
  },
  mounted() {
    this.initWebGL();
  },
  methods: {
    handleMousemoveEvent(event) {
      this.mouseX = event.offsetX;
      this.mouseY = this.$refs.canvas.height - event.offsetY;
    },
    handleMousedownEvent() {
      this.mouseDown = 1;
    },
    handleMouseupEvent() {
      this.mouseDown = 0;
    },
    initWebGL() {
      const canvas = this.$refs.canvas;
      this.gl = canvas.getContext("webgl");
      if (!this.gl) {
        console.error("WebGL не поддерживается вашим браузером!");
        return;
      }

      this.canvasWidth = canvas.clientWidth;
      this.canvasHeight = canvas.clientHeight;

      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      this.gl.viewport(0, 0, canvas.width, canvas.height);
      this.createProgram();
    },
    createProgram() {
      const gl = this.gl;

      // Вершинный шейдер
      const vertexShaderSource = vertexShaderCode;
      const vertexShader = this.compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);

      // Фрагментный шейдер
      const fragmentShader = this.compileShader(gl, this.code, gl.FRAGMENT_SHADER);
      if (!fragmentShader) return;

      // Создание и линковка программы
      this.program = gl.createProgram();
      gl.attachShader(this.program, vertexShader);
      gl.attachShader(this.program, fragmentShader);
      gl.linkProgram(this.program);

      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error("Ошибка линковки программы:", gl.getProgramInfoLog(this.program));
        return;
      }

      gl.useProgram(this.program);
      this.setupBuffers();

      // Инициализация таймерных переменных:
      this.accumulatedTime = 0;
      this.lastFrameTime = performance.now(); // миллисекунды
      this.frame = 0;
      this.startRendering();
    },
    compileShader(gl, source, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Ошибка компиляции шейдера:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    },
    setupBuffers() {
      const gl = this.gl;
      const vertices = new Float32Array([
        -1.0, 1.0,
        1.0, 1.0,
        -1.0, -1.0,
        1.0, -1.0
      ]);
      const indices = new Uint16Array([0, 1, 2, 1, 3, 2]);

      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

      const aPosition = gl.getAttribLocation(this.program, "a_position");
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
      gl.enableVertexAttribArray(aPosition);
    },
    startRendering() {
      const gl = this.gl;
      const location = {
        iTime: gl.getUniformLocation(this.program, "iTime"),
        iResolution: gl.getUniformLocation(this.program, "iResolution"),
        iMouse: gl.getUniformLocation(this.program, "iMouse"),
        deltaTime: gl.getUniformLocation(this.program, "deltaTime"),
        iFrame: gl.getUniformLocation(this.program, "iFrame")
      };

      const render = () => {
        const now = performance.now();
        // Вычисляем deltaTime (в секундах)
        let deltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        if (!this.isPaused) {
          // Прибавляем deltaTime только если не на паузе
          this.accumulatedTime += deltaTime;
          this.frame++;
        } else {
          // Если на паузе — обновляем lastFrameTime, чтобы не накопился большой deltaTime при возобновлении
          this.lastFrameTime = now;
        }

        // Передаём в текущий кадр
        gl.uniform1f(location.iTime, this.accumulatedTime);
        gl.uniform2f(location.iResolution, this.$refs.canvas.width, this.$refs.canvas.height);
        gl.uniform3f(location.iMouse, this.mouseX, this.mouseY, this.mouseDown);
        gl.uniform1f(location.deltaTime, deltaTime);
        gl.uniform1i(location.iFrame, this.frame);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

        this.requestId = requestAnimationFrame(render);
      };

      this.requestId = requestAnimationFrame(render);
    },
    updateShader() {
      this.updateFragmentShader();
      cancelAnimationFrame(this.requestId); // освобождение ресурсов
      this.startRendering();
    },
    togglePause() {
      // При переключении паузы обновляем флаг.
      // Если возобновляем — обновляем lastFrameTime, чтобы не получить большой deltaTime.
      if (this.isPaused) {
        this.lastFrameTime = performance.now();
      }
      this.isPaused = !this.isPaused;
    },
    resetTime() {
      // Сброс времени: accumulatedTime обнуляется, и обновляется lastFrameTime.
      this.accumulatedTime = 0;
      this.frame = 0;
      this.lastFrameTime = performance.now();
    },
    updateFragmentShader() {
      const gl = this.gl;
      const newFragmentShader = this.compileShader(gl, this.code, gl.FRAGMENT_SHADER);
      if (!newFragmentShader) return;

      // Отсоединяем старый фрагментный шейдер (предполагается, что он второй)
      const shaders = gl.getAttachedShaders(this.program);
      if (shaders && shaders.length > 1) {
        gl.detachShader(this.program, shaders[1]);
      }
      gl.attachShader(this.program, newFragmentShader);
      gl.linkProgram(this.program);

      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error("Ошибка линковки обновленного шейдера:", gl.getProgramInfoLog(this.program));
        return;
      }
      gl.useProgram(this.program);
    }
  },
};
</script>

<style scoped>
.shader-window {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 10px;
  flex: 1;
  height: 60vh;
}

canvas {
  flex: 1;
  width: 100%;
  border-radius: 10px;
}

.btns {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  margin-top: 10px;
}

.btn {
  background: transparent;
  border: 1px solid lightgray;
  border-radius: 8px;
  padding: 4px;
  font-size: large;
  color: lightgray;
  cursor: pointer;
  margin-right: 10px;

}

.btn:hover {
  color: white;
}

.info {
  display: inline-block;
  margin-right: 10px;
  color: lightgray;
}

.info-wrapper {
  display: flex;
  justify-content: flex-start;
}

.under-canvas {
  margin-top: 10px;
  padding: 10px;
  width: 100%;
  background: #282C34;
  border-radius: 8px;
}

hr {
  margin-top: 10px;
  width: 100%;
  color: lightgray;
}
</style>
