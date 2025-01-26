<template>
  <div class="nav-bar">
    <button class="nav-bar__main-btn" @click="console.log('hello')">ShaderToy</button>
    <div class="nav-bar__items">
      <button>1</button>
      <button>2</button>
      <button>3</button>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.nav-bar{
  display: flex;
  background: red;
  min-height: 50px;
}
.nav-bar__items{
  margin-left: auto;
}
.nav-bar__main-btn{
  background: transparent;
  font-size: xxx-large;
  border: none;
  padding: 5px
}
.nav-bar__main-btn:hover{
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
</style>