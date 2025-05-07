<template>
  <svg :stroke="color" :width="width" :height="height" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">

    <g id="cross" fill="none" :stroke="color" stroke-linecap="round"
       stroke-linejoin="round"
       stroke-width="3px">

      <line class="cls-1" x1="4" x2="28" y1="4" y2="28"/>

      <line class="cls-1" x1="4" x2="28" y1="28" y2="4"/>

    </g>

  </svg>

</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: "lightgrey"
    },
    width: {
      type: Number,
      default: 28
    },
    height: {
      type: Number,
      default: 28
    }
  }
};
</script>