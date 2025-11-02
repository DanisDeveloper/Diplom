<template>
  <div class="wrapper">
    <button
        v-for="option in options"
        :key="option"
        class="option-button"
        :class="{ active: modelValue === option }"
        @click="handleButtonClick(option)"
    >
      {{ option }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'radio-buttons',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true
    }
  },
  emits: ['update:modelValue'],
  methods: {
    handleButtonClick(option) {
      this.$emit('update:modelValue', option)
    }
  }
};
</script>

<style scoped>
.option-button {
  padding: 4px 8px;
  margin: 0 4px;
  border-radius: 8px;
  background: transparent;
  font-size: large;
  cursor: pointer;
  color: #282C34;
  transition: all 0.3s ease;
  border: 1px solid #282C34;
}

.option-button.active, .option-button:hover {
  background: #282C34;
  color: lightgray;
}


</style>