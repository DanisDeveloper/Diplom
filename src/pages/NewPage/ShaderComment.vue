<template>
  <img
      class="comment__avatar"
      width="40"
      height="40"
      :src="`${this.PUBLIC_API_URL}/${comment.user.avatarUrl ? comment.user.avatarUrl : 'images/avatar.png'}`"
      @click="$router.push(`/profile/${comment.user.name}`)"
      alt="avatar">
  <icon-button v-if="this.$store.state.user.id === comment.user.id" class="comment__hide">
    <spinner v-if="isSavingHiddenState" disabled/>
    <unhide-icon
        v-else-if="comment.hidden"
        v-tooltip="'Unhide comment'"
        @click="handleHideButton(comment, index)"/>
    <hide-icon
        v-else
        v-tooltip="'Hide comment'"
        @click="handleHideButton(comment, index)"/>
  </icon-button>
  <div class="comment__header">
            <span @click="$router.push(`/profile/${comment.user.name}`)" class="link">
              {{ comment.user.name }}
            </span>
    in {{ formatDate(comment.createdAt) }}
  </div>
  <div class="comment__content">
    {{ !comment.hidden ? comment.text : "Comment was hidden" }}
  </div>
</template>


<script>
import formatDate from "@/utils/formatDate.js";
import Error from "@/components/Error.vue";

export default {
  name: "shader-comment",

  data() {
    return {
      commentIdToHide: null,
      isSavingHiddenState: false,
      API_URL: import.meta.env.VITE_API_URL,
      PUBLIC_API_URL: import.meta.env.VITE_PUBLIC_API_URL
    }
  },
  props: {
    comment: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    shaderId: {
      type: Number,
      required: true
    }
  },
  methods: {
    formatDate,
    handleHideButton(comment, index) {
      this.isSavingHiddenState = true;

      fetch(`${this.API_URL}/shaders/${this.shaderId}/comments/${comment.id}?hidden=${!comment.hidden}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        credentials: 'include'
      }).then(response => {
        if (!response.ok) {
          throw new Error(response.text() || "Server returned an error");
        }
        comment.hidden = !comment.hidden;
      }).catch(error => {
        this.$refs.errorToast.show("Error hiding comment");
      }).finally(() => {
        this.isSavingHiddenState = false;
      })
    },
  }
}
</script>


<style scoped>
.comment__header {
  display: flex;
  width: fit-content;
}

.comment__avatar {
  float: left;
  margin-right: 10px;
  border-radius: 8px;
  cursor: pointer;
}

.comment__hide {
  cursor: pointer;
  float: right;

  background: transparent;
  border-radius: 8px;
  border: 1px solid #282C34;
  color: lightgray;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border 0.2s ease;

}

.comment__hide:hover {
  border-color: lightgray;
}

</style>