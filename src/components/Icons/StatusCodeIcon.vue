<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="90" fill="transparent" stroke="#8c2115" stroke-width="6"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
          font-family="Arial, sans-serif" font-size="60" fill="#8c2115">
      {{ text }}
    </text>


  </svg>


</template>

<script>
export default {
  name: "status-code-icon",
  props: {
    color: {
      type: String,
      default: "lightgrey"
    },
    text: {
      type: String,
      default: ""
    }
  }
};
</script>