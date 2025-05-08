<template>
  <div class="dialog" v-if="show" @click.stop="hideDialog">
    <div @click.stop class="dialog__content">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: "dialog-window",
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  methods:{
    hideDialog(){
      this.$emit('update:show', false)
    }
  }


}
</script>


<style scoped>
.dialog {
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  position: fixed;
  display: flex;
  background-color: rgba(0, 0, 0, 0.6); /* затемнение посильнее */
  z-index: 999;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px); /* размытие заднего фона */
}

.dialog__content {
  margin: auto;
  background: #1e1e2f; /* чуть темнее и насыщеннее */
  border-radius: 12px;
  padding: 24px 32px;
  color: #f0f0f0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6); /* тень вокруг окна */
  transform: scale(1);
  transition: all 0.3s ease;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
}

</style>