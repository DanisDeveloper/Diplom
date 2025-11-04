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
  min-height: 100vh;
}

html {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Crect width='10' height='10' fill='%23f0f0f0'/%3E%3Cpath d='M0 0h10v10H0z' fill='none' stroke='%23dcdcdc' stroke-width='0.5'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: auto; /* Оригинальный размер */
}

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

}

.app {
  display: flex;
  flex: 1;
  overflow: hidden;
  flex-direction: column;
  padding-top: 3.5rem;
}

.v-tooltip {
  position: absolute;
  background: rgba(50, 50, 50, 0.95); /* чуть светлее, почти непрозрачный */
  color: #fff; /* чистый белый текст */
  padding: 10px 16px; /* больше внутренних отступов */
  border-radius: 6px; /* более закруглённые углы */
  font-size: 15px; /* чуть больше шрифт */
  font-weight: 500; /* полужирный для контрастности */
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
  opacity: 0; /* по умолчанию скрыта */
  transform: translateY(4px); /* чтобы анимация выглядела плавнее */
  transition: opacity 0.2s ease, transform 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); /* объёмная тень */
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Псевдо‑стрелочка сверху */
.v-tooltip::after {
  content: "";
  position: absolute;
  top: -6px;
  left: 12px; /* можно подкорректировать по центру элемента */
  border-width: 6px;
  border-style: solid;
  border-color: transparent transparent rgba(50, 50, 50, 0.95) transparent;
}

/* При показе (в директиве нужно просто менять opacity и transform) */
.v-tooltip.show {
  opacity: 1;
  transform: translateY(0);
}


.link {
  font-weight: bold;
}

.link:hover {
  text-decoration: underline;
  cursor: pointer;
}
</style>