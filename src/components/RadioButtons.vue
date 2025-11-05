<template>
  <div class="wrapper">
    <button
        v-for="option in options"
        :key="option"
        class="gradient"
        :class="{ selected: modelValue === option }"
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
.wrapper{
  display: flex;
  gap: 8px;
}

</style>