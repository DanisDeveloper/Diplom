<template>
  <div class="nav-bar">
    <button class="nav-bar__main-btn" @click="console.log('hello')">ShaderToy</button>
    <div class="nav-bar__items">
      <button class="nav-bar__other-btn" @click="console.log('new')">New</button>
      <button class="nav-bar__other-btn" @click="console.log('log in')">Log in</button>
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
  background: gray;
  min-height: 50px;
}
.nav-bar__items{
  margin-left: auto;
  display: flex;
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
.nav-bar__other-btn{
  padding: 10px;
  margin: 10px;
  border: none;
  background: transparent;
  font-size: large;
  cursor: pointer;
}
</style>