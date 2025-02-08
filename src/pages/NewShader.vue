<template>
  <div class="main">
    <!--       TODO сделать элемент shader-window независимым-->
    <shader-window :code></shader-window>
    <shader-editor v-model="code"></shader-editor>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import ShaderWindow from "@/components/ShaderWindow.vue";
import ShaderEditor from "@/components/ShaderEditor.vue";
import fragmentShader from "@/shaders/fragment.js";
import FooterInfo from "@/components/AppFooter.vue";

export default {
  components: {FooterInfo, ShaderEditor, ShaderWindow, NavBar},
  data() {
    return {
      code: fragmentShader
    }
  },
}
</script>

<style scoped>

.main {
  display: flex;
  justify-content: space-between;
}
</style>