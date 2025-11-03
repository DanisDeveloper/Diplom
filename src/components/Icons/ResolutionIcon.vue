
<template>
  <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" viewBox="0 0 24 24" fill="none" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="20" x2="16" y2="20"></line>
    <line x1="12" y1="18" x2="12" y2="20"></line>
  </svg>

</template>

<script>
export default {
  name: "ResolutionIcon",
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