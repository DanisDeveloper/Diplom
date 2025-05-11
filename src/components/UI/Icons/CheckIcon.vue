<template>
  <svg :width="width" :height="height" viewBox="0 -2 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>action / 5 - action, check, checkmark, ok icon</title>
    <g id="Free-Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
      <g transform="translate(-452.000000, -85.000000)" id="Group" :stroke="color" stroke-width="2">
        <g transform="translate(449.000000, 80.000000)" id="Shape">
          <polyline points="4 10.5711735 10.2222222 18 20 6">

          </polyline>
        </g>
      </g>
    </g>
  </svg>

</template>

<script>
export default {
  name: "check-icon",
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