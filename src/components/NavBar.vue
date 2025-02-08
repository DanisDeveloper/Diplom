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
  background: rgb(40, 44, 52);
  min-height: 50px;
}
.nav-bar__items{
  margin-left: auto;
  display: flex;
}
.nav-bar__main-btn{
  background: transparent;
  font-size: xx-large;
  border: none;
  padding: 5px;
  color: lightgray;
}
.nav-bar__main-btn:hover{
  cursor: pointer;
  color: white;
}
.nav-bar__other-btn{
  padding: 10px;
  margin: 10px;
  border: 1px solid lightgray;
  border-radius: 8px;
  background: transparent;
  font-size: large;
  cursor: pointer;
  color: lightgray;
}
.nav-bar__other-btn:hover{
  color: white;
}
</style>