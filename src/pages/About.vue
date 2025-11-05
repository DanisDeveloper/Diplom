<template>
  <div class="about-container">
    <h1>About FragmentVerse</h1>
    <p>
      FragmentVerse is an interactive platform for creating and showcasing real-time fragment shaders, inspired by ShaderToy.
      It allows developers, artists, and enthusiasts to write GLSL shaders directly in the browser and see the results instantly.
    </p>

    <h2>Features:</h2>
    <ul>
      <li>Live shader editor with real-time preview</li>
      <li>Support for uniform variables</li>
      <li>User profiles and shader gallery</li>
      <li>Comments, likes, and rating system</li>
      <li>Responsive and adaptive layout for all devices</li>
    </ul>

    <h2>Technologies:</h2>
    <ul>
      <li>Frontend: Vue.js, WebGL / GLSL</li>
      <li>Backend: Java Spring Boot</li>
      <li>Database: PostgreSQL</li>
    </ul>


    <p>
      Feedback and contributions are welcome! Feel free to reach out or submit suggestions via GitHub.
    </p>
  </div>
</template>

<script>
export default {
  name: "about-page",
};
</script>

<style scoped>
.about-container {
  color: #282c34;
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem 2rem;
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

h2 {
  font-size: 1.6rem;
  margin-top: 2rem;
  font-weight: 600;
}

ul {
  padding-left: 1.5rem;
  list-style-type: disc;
}

li {
  margin-bottom: 0.5rem;
}

p {
  margin-top: 1rem;
  font-size: 1rem;
}
</style>
