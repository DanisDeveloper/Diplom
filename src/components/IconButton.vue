<template>
  <button class="action-icon-btn">
    <slot></slot>
  </button>
</template>

<script>

export default {
  name: "icon-button"
}
</script>



<style scoped>
.action-icon-btn {
  background: transparent;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  margin: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border 0.2s ease;
  width: 36px;
  height: 36px;
}

.action-icon-btn:hover {
  border: 1px solid lightgray;
}
</style>