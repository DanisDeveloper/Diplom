<template>
  <transition name="slide-fade" @after-leave="$emit('hidden')">
    <div v-if="visible" class="toast">
      <div class="message">{{ message }}</div>
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'toast',
  props: {
    message: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 5000,
    },
    background:{
      type: String,
      default: '#f44336'
    }
  },
  data() {
    return {
      visible: false,
      progress: 100,
      startTime: null,
      intervalId: null,
    };
  },
  methods: {
    show() {
      clearInterval(this.intervalId); // сбрасываем старый таймер
      this.visible = true;
      this.startTime = Date.now();
      this.progress = 100;

      this.intervalId = setInterval(() => {
        const elapsed = Date.now() - this.startTime;
        const remaining = this.duration - elapsed;

        this.progress = Math.max((remaining / this.duration) * 100, 0);

        if (remaining <= 0) {
          this.close();
        }
      }, 100);
    },
    close() {
      clearInterval(this.intervalId);
      this.visible = false;
    },
  },
  beforeUnmount() {
    clearInterval(this.intervalId);
  },
};
</script>

<style scoped>
.toast {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background-color: v-bind(background);
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 240px;
  max-width: 300px;
  overflow: hidden;
  z-index: 1000;
}

.message {
  margin-bottom: 8px;
}

.progress-bar {
  height: 4px;
  background-color: rgba(255, 255, 255, 0.7);
  transition: width 0.1s linear;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
