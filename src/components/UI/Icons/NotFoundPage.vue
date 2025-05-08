<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <!-- Круг -->
    <circle cx="100" cy="100" r="90" fill="transparent" :stroke="color" stroke-width="6"/>
    <!-- Текст 404 -->
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
          font-family="Arial, sans-serif" font-size="60" :fill="color">
      404
    </text>
  </svg>


</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: "lightgrey"
    },
  }
};
</script>