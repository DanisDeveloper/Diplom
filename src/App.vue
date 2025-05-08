<template>
  <div class="layout">
    <nav-bar></nav-bar>
    <div class="app">
      <router-view :key="$route.fullPath"></router-view>
    </div>
    <footer-info></footer-info>
  </div>
</template>

<script>
import FooterInfo from "@/components/AppFooter.vue";
import NavBar from "@/components/NavBar.vue";

export default {
  components: {NavBar, FooterInfo}
}
</script>

<style>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, .app {
  height: 100%;
}

html {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Crect width='10' height='10' fill='%23f0f0f0'/%3E%3Cpath d='M0 0h10v10H0z' fill='none' stroke='%23dcdcdc' stroke-width='0.5'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: auto; /* Оригинальный размер */
}

.layout{
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app {
  display: flex;
  flex: 1;
  overflow: hidden;
  flex-direction: column;
}

.v-tooltip {
  position: absolute;
  background: rgba(50, 50, 50, 0.95);
  color: #fff;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transform: translateY(8px) scale(0.95);
  /* вместо transition используем animation */
  animation: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255,255,255,0.2);
}

/* Стрелочка сверху */
.v-tooltip::after {
  content: "";
  position: absolute;
  top: -6px;
  left: 12px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent transparent rgba(50, 50, 50, 0.95) transparent;
}

/* Ключевые кадры для анимации появления */
@keyframes tooltipFadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* При добавлении класса .show запускаем анимацию */
.v-tooltip.show {
  animation: tooltipFadeIn 0.25s ease-out forwards;
}


</style>