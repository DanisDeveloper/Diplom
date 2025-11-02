<template>
  <div class="shader-info">
    <div class="shader-info__component"><strong>Frame:</strong> {{ this.frame }}</div>
    <div class="shader-info__component"><strong>Time:</strong> {{ accumulatedTime.toFixed(2) }}</div>
    <div class="shader-info__component"><strong>Resolution:</strong> {{ canvasWidth }}x{{ canvasHeight }}</div>
  </div>

</template>

<script>
export default {
  name: "shader-window-info",
  props: {
    frame: {
      type: Number,
      required: true,
    },
    accumulatedTime: {
      type: Number,
      required: true,
    },
    canvasWidth: {
      type: Number,
      required: true,
    },
    canvasHeight: {
      type: Number,
      required: true,
    }
  }
}
</script>


<style scoped>
.shader-info__component {
  display: inline-block;
  margin-right: 10px;
  color: lightgray;
}

.shader-info {
  display: flex;
  justify-content: flex-start;
}
</style>