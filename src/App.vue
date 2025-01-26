<template>
  <div class="app">
    <nav-bar></nav-bar>
    <div class="main">
      <shader-window></shader-window>
      <code-area></code-area>
    </div>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import ShaderWindow from "@/components/ShaderWindow.vue";
import CodeArea from "@/components/CodeArea.vue";

export default {
  components: {CodeArea, ShaderWindow, NavBar},
}
</script>

<style>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.main {
  display: flex;
  justify-content: space-between;
  height: 100%;
}


</style>