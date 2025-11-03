<template>
  <div class="shader-info">
    <div class="shader-info__component">
      <timer-icon v-tooltip="'Time'"/>
      {{ accumulatedTime.toFixed(2) }}
    </div>
    <div class="shader-info__component">
      <resolution-icon v-tooltip="'Resolution'"/>
      {{ canvasWidth }}x{{ canvasHeight }}
    </div>
  </div>

</template>

<script>
import TimerIcon from "@/components/Icons/TimerIcon.vue";
import ResolutionIcon from "@/components/Icons/ResolutionIcon.vue";

export default {
  name: "shader-window-info",
  components: {ResolutionIcon, TimerIcon},
  props: {
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
.shader-info {
  display: flex;
  gap: 15px;
}

.shader-info__component {
  display: flex;
  align-items: center;
  gap: 5px;
  color: lightgray;
  white-space: nowrap;
}
</style>