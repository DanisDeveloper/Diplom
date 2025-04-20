<template>
  <div class="shader-container">
    <div class="best-shader">
      <!-- Левая половина: сам шейдер -->
      <div class="half">
        <h2>Best shader</h2>
        <shader-window
            ref="bestShaderWindow"
            @mouseenter="this.$refs.bestShaderWindow.togglePause()"
            @mouseleave="this.$refs.bestShaderWindow.togglePause()"
            :code="bestShader"
            @click="this.$router.push({ path: '/new', query: { code: bestShader } })"
            :disable-mouse-down-event="true"
            :disable-mouse-up-event="true"
            :disable-mouse-move-event="true"
        />
      </div>
      <!-- Правая половина: текст -->
      <div class="half phrase">
        Build and Share your best shaders with the world and get Inspired
      </div>
    </div>

    <div class="featured-shaders-wrapper">
      <h2>Featured shaders</h2>
      <div class="featured-shaders">
        <shader-window
            ref="featureShaderWindows"
            v-for="n in 4"
            :key="n"
            :code="featuredShaders[n - 1]"
            class="feature-shader"
            @click="this.$router.push({ path: '/new', query: { code: featuredShaders[n - 1] } })"
            @mouseenter="handleMouseEnter(n - 1)"
            @mouseleave="handleMouseLeave(n - 1)"
            :disable-mouse-down-event="true"
            :disable-mouse-up-event="true"
            :disable-mouse-move-event="true"
        />
      </div>
    </div>
  </div>
</template>


<script>
import ShaderWindow from "@/components/ShaderWindow.vue";
import funnel from "@/shaders/fragment.js";
import mandelbrot from "@/shaders/mandelbrot.js"
import tonnel from "@/shaders/tonnel.js"
import fractal from "@/shaders/fractal.js"
import voronoi from "@/shaders/voronoi.js"

export default {
  components: {ShaderWindow},
  data() {
    return {
      bestShader: mandelbrot,
      featuredShaders: [funnel, voronoi, tonnel, fractal],

    }
  },
  methods: {
    handleMouseEnter(index) {
      this.$refs.featureShaderWindows[index].togglePause();
    },
    handleMouseLeave(index) {
      this.$refs.featureShaderWindows[index].togglePause()
    }
  },
  mounted() {
    this.$refs.bestShaderWindow.togglePause();
    this.$refs.featureShaderWindows.forEach(ref => {
      ref.togglePause();
    })
  }
}
</script>

<style scoped>
.best-shader {
  display: flex;
  justify-content: space-between;
  margin: 10px;
}

.half {
  flex: 1;
}

.featured-shaders-wrapper {
  margin: 10px;
}

.featured-shaders {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  gap: 2rem;
}

.feature-shader {
  flex: 1;
}

.shader-window :deep(canvas) {
  border-radius: 10px;
}

.phrase {
  margin: 0px 10px;
  font-size: 400%;
  color: rgb(40, 44, 52);
  align-self: center;
}
</style>
