<template>
  <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" viewBox="0 0 24 24" fill="none" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="6" x2="12" y2="12"></line>
    <line x1="12" y1="12" x2="16" y2="14"></line>
  </svg>
</template>

<script>
export default {
  name: "TimerIcon",
  props: {
    color: {
      type: String,
      default: "lightgrey"
    },
    width: {
      type: Number,
      default: 24
    },
    height: {
      type: Number,
      default: 24
    }
  }
}
</script>



<style scoped>

</style>