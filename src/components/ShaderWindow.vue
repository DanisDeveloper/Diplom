<template>
  <canvas ref="canvas"
          @mousemove="handleMousemoveEvent"
          @mousedown="handleMousedownEvent"
          @mouseup="handleMouseupEvent"
          class="shader-window">
  </canvas>
</template>

<script>
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
      mouseX: 0,
      mouseY: 0,
      mouseDown: 0,
    }
  },
  computed: {
    width() {
      console.log(this.$refs.canvas.width)
      return this.$refs.canvas.width
    },
    height() {
      console.log(this.$refs.canvas.height)
      return this.$refs.canvas.height
    }
  },
  watch: {
    code(newShader) {
      this.initWebGL();
    }
  },
  mounted() {
    this.initWebGL();
  },
  methods: {
    handleMousemoveEvent(event) {
      this.mouseX = event.offsetX;
      this.mouseY = event.offsetY; // Инвертируем, т.к. отсчет должен начинаться снизу
      // console.log(`${this.mouseX}, ${this.mouseY}`); // TODO прокинуть mouse в shader
    },
    handleMousedownEvent(event) {
      this.mouseDown = 1;
    },
    handleMouseupEvent(event){
      this.mouseDown = 0;
    },
    initWebGL() {
      // Инициализация WEBGL
      const canvas = this.$refs.canvas;
      const gl = canvas.getContext("webgl");
      if (!gl) {
        console.log("WebGL не поддерживается вашим браузером!");
        // TODO сделать вывод ошибка на экран, а не в консоль
        return;
      }

      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Вершинный шейдер
      const vertexShaderSource = `
    attribute vec2 a_position;

    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;
      // Фрагментный шейдер берется от клиента
      const fragmentShaderSource = this.code;

      // Компиляция шейдеров
      const vertexShader = this.compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
      const fragmentShader = this.compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

      // Создание программы
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Ошибка линковки программы:", gl.getProgramInfoLog(program));
        return; // Выход из функции
      }

      gl.useProgram(program);

      // Определение вершин прямоугольника
      const vertices = new Float32Array([
        -1.0, 1.0,  // Верхний левый угол
        1.0, 1.0,  // Верхний правый угол
        -1.0, -1.0,  // Нижний левый угол
        1.0, -1.0   // Нижний правый угол
      ]);

      // Индексы для рисования прямоугольника
      const indices = new Uint16Array([
        0, 1, 2,
        1, 3, 2
      ]);

      // Создание буфера вершин
      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      // Связывание атрибутов
      const aPosition = gl.getAttribLocation(program, 'a_position');
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
      gl.enableVertexAttribArray(aPosition);

      // Создание буфера индексов
      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

      // Получение uniform-переменной для времени
      const iTimeLocation = gl.getUniformLocation(program, "iTime");
      const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
      const iMouseLocation = gl.getUniformLocation(program, "iMouse");

      // Установка цвета фона и очистка канваса
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // ===== Отрисовка =====
      let location = {
        "iTime": iTimeLocation,
        "iResolution": iResolutionLocation,
        "iMouse": iMouseLocation,
      }
      this.render(gl, location, indices);

    },
    // Функция компиляции шейдера
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
    render(gl, location, indices) {
      const time = performance.now() / 1000; // Текущее время в секундах

      // Uniform-переменные
      gl.uniform1f(location['iTime'], time);
      gl.uniform2f(location['iResolution'], this.width, this.height);
      gl.uniform3f(location['iMouse'], this.mouseX, this.mouseY, this.mouseDown);

      // Отрисовка прямоугольника
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

      // Запускаем следующий кадр
      requestAnimationFrame(() => {
        this.render(gl, location, indices);
      });
    }
  },
}
</script>

<style scoped>
.shader-window {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: 40vh;
  background-color: #f0f0f0;
  margin: 10px;
  border-radius: 10px;
}

</style>
