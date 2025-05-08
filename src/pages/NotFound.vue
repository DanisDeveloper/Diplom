<template>
  <div class="not-found">
    <status-code-icon :text="404"></status-code-icon>
    <h1>Page not found</h1>
  </div></template>

<script>
import ForbiddenIcon from "@/components/UI/Icons/ForbiddenIcon.vue";
import StatusCodeIcon from "@/components/UI/Icons/StatusCodeIcon.vue";

export default {
  name: "NotFound",
  components: {StatusCodeIcon, ForbiddenIcon}
}
</script>



<style scoped>
.not-found{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  margin-top: 100px;
  color: #282C34;
}
</style>