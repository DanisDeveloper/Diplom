<template>
  <div class="about-container">
    <h1>About This Project</h1>
    <p>
      This website is an interactive platform for creating and showcasing real-time fragment shaders, inspired by ShaderToy.
      It allows developers, artists, and enthusiasts to write GLSL shaders directly in the browser and see the results instantly.
    </p>
    <h2>Features:</h2>
    <ul>
      <li>Live shader editor with real-time preview</li>
      <li>Support for uniform variables</li>
      <li>User profiles and shader gallery</li>
      <li>Comments and rating system</li>
    </ul>
    <h2>Technologies:</h2>
    <ul>
      <li>WebGL / GLSL</li>
      <li>Vue.js</li>
      <li>FastAPI</li>
      <li>PostgreSQL</li>
      <li>Docker</li>
    </ul>
    <p>
      Feedback and suggestions are welcome!
    </p>
  </div>
</template>

<script>
export default {
  name: "AboutPage",
};
</script>

<style scoped>

.about-container {
  color: #282c34;
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: sans-serif;
  line-height: 1.6;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.4rem;
  margin-top: 1.5rem;
}

ul {
  padding-left: 1.5rem;
  list-style-type: disc;
}

p {
  margin-top: 1rem;
}
</style>
