<template>
  <div class="loader-wrapper">
    <div class="smartglass-loader">
      <div class="arc arc1"></div>
      <div class="arc arc2"></div>
      <div class="arc arc3"></div>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style scoped>

.loader-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin: auto;
}

.smartglass-loader {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
}

.arc {
  position: absolute;
  border: 6px solid transparent;
  border-top-color: #282C34;
  border-radius: 50%;
  animation: spin linear infinite;
}

.arc1 {
  width: 100%;
  height: 100%;
  animation-duration: 1.05s;
}

.arc2 {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  animation-duration: 0.95s;
}

.arc3 {
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  animation-duration: 0.85s;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>