<template>
  <div class="toast-container">
    <transition-group name="slide-fade" tag="div">
      <div v-for="toast in state.toasts" :key="toast.id" class="toast" :style="{ backgroundColor: toast.background }">
        <div class="message">{{ toast.message }}</div>
        <div class="progress-bar" :style="{ width: toast.progress + '%' }"></div>
      </div>
    </transition-group>
  </div>
</template>

<script>

import {useToast} from "@/composables/useToast.js";

export default {
  setup() {
    const { state } = useToast();
    return { state };
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column-reverse; /* новые тосты снизу */
  gap: 10px;
  z-index: 1000;
}

.toast {
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  min-width: 240px;
  max-width: 300px;
  overflow: hidden;
}

.message {
  margin-bottom: 8px;
}

.progress-bar {
  height: 4px;
  background-color: rgba(255,255,255,0.7);
  transition: width 0.05s linear;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(20%);
}
</style>
