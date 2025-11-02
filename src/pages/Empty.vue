<template>
  <error :status="404"></error>
</template>

<script>
import ForbiddenIcon from "@/components/Icons/ForbiddenIcon.vue";
import StatusCodeIcon from "@/components/Icons/StatusCodeIcon.vue";
import Error from "@/components/Error.vue";

export default {
  name: "Empty",
}
</script>



<style scoped>
.error{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  margin-top: 100px;
  color: #282C34;
}
</style>