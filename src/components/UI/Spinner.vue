<template>
  <div class="spinner"></div>
</template>

<script>
export default {
  name: "Spinner"
}
</script>

<style scoped>
.spinner {
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  width: 24px;
  height: 24px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>