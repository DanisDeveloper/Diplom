<template>
  <div class="error">
    <status-code-icon :text="status"></status-code-icon>
    <h1>{{ text}}</h1>
  </div>
</template>

<script>
import ForbiddenIcon from "@/components/UI/Icons/ForbiddenIcon.vue";
import StatusCodeIcon from "@/components/UI/Icons/StatusCodeIcon.vue";

export default {
  name: "Error",
  components: {StatusCodeIcon, ForbiddenIcon},
  props: {
    status: {
      type: Number,
      required: true
    }
  },
  computed: {
    text() {
      switch (this.status) {
        case 401:
          return "Unauthorized";
        case 403:
          return "Forbidden";
        case 404:
          return "Not found";
        case 500:
          return "Server error";
        default:
          return "Unknown error";
      }
    }
  }
}
</script>


<style scoped>
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  margin-top: 100px;
  color: #282C34;
}
</style>