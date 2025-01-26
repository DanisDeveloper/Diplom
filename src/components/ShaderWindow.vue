<template xmlns="http://www.w3.org/1999/html">
  <canvas ref="canvas" class="shader-window">
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
    return {};
  },
  mounted() {
    this.initWebGL();
  },
  methods: {
    initWebGL() {
      const canvas = this.$refs.canvas;
      const gl = canvas.getContext("webgl");
      if (!gl) {
        console.log("WebGL не поддерживается вашим браузером!");
        // TODO сделать вывод ошибка на экран, а не в консоль
        return;
      }
      // Вершинный шейдер
      const vertexShaderSource = `
    attribute vec2 a_position;
    varying vec2 v_position;

    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_position = a_position; // Передаем позицию во фрагментный шейдер
    }
  `;

      // Фрагментный шейдер
      const fragmentShaderSource = `
    precision mediump float;
    varying vec2 v_position;  // Получаем координаты пикселя

    void main() {
      vec2 uv = v_position * 0.5 + 0.5; // Преобразуем координаты в диапазон [0,1]

      // Цвет зависит от координат (градиент)
      vec3 color = vec3(uv.x, uv.y, 0.5); // Пример градиента от красного к зеленому

      gl_FragColor = vec4(color, 1.0); // Устанавливаем финальный цвет
    }
  `;
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

      // Установка цвета фона и очистка канваса
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Отрисовка прямоугольника
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);


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
  },
}
;
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
}

</style>
