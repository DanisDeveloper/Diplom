<template>
  <div class="shader-container">
    <!-- Большое главное окно -->
    <h2>Best shader</h2>
    <div class="main-window">
      <shader-window :code="code"/>
    </div>
    <!-- Четыре маленьких окна -->
    <h2>Featured shaders</h2>
    <div class="small-windows">
      <shader-window v-for="n in 4" :key="n" :code="code" class="small-window"/>
    </div>
  </div>
</template>

<script>
import ShaderWindow from "@/components/ShaderWindow.vue";
import fragmentShader from "@/shaders/fragment.js";

export default {
  components: {ShaderWindow},
  data() {
    return {
      code: fragmentShader
    }
  }
}
</script>

<style scoped>
/* Контейнер занимает всю высоту родительского блока */
.shader-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden; /* предотвращает переполнение, если содержимое станет больше */
}

/* Главное окно: занимает всё оставшееся пространство, но не выходит за границы */
.main-window {
  flex: 1;
  margin-bottom: 10px;
  overflow: hidden;
}

/* Контейнер для маленьких окон */
.small-windows {
  display: flex;
  justify-content: space-between;
  height: 25%; /* можно регулировать */
  overflow: hidden;
}

/* Стили для каждого маленького окна */
.small-window {
  flex: 1;
  margin: 0 5px;
  overflow: hidden;
}

/* Ограничиваем размеры компонента shader-window, чтобы он не превышал размер родителя */
.main-window shader-window,
.small-window shader-window {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  display: block;
  object-fit: contain; /* Если shader-window использует img или canvas, для автоподгонки содержимого */
}
</style>
