<template>
  <textarea v-model="code" class="code-area" rows="35">

  </textarea>

</template>

<script>
export default {
  data(){
    return {
      code: ""
    }
  }
}
</script>

<style scoped>
.code-area {
  flex: 1;
  display: flex;
  padding: 10px;
  width: 100%;
  height: 100%;
  resize: none;
  font-size: 1rem;
}
</style>