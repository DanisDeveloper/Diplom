<template>
  <nav-bar></nav-bar>
  <div class="app">
    <router-view :key="$route.fullPath"></router-view>
  </div>
  <footer-info></footer-info>
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

.app {
  display: flex;
  flex-direction: column;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Crect width='10' height='10' fill='%23f0f0f0'/%3E%3Cpath d='M0 0h10v10H0z' fill='none' stroke='%23dcdcdc' stroke-width='0.5'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: auto; /* Оригинальный размер */
  min-height: 100vh;
}


</style>