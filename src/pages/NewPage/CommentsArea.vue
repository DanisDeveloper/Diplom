<template>
  <div class="comments-area-wrapper">
    <h3>Comments ({{ this.comments.length }})</h3>
    <div v-if="shaderId !== 0 || this.comments.length > 0" class="comments-area">
      <div class="comment-post" :class="{'comments-empty' : comments.length === 0}">
      <textarea
          @change="textAreaChanged"
          @input="textAreaChanged"
          class="comment-input"
          ref="commentInput"
          placeholder="Your comment..."
          v-model.trim="this.comment">
      </textarea>
        <div v-if="this.comment.length > 0" class="comment-buttons">
          <button class="btn" @click="handleCancelCommentButton">
            Cancel
          </button>
          <button
              :disabled="isCommentPosting"
              class="btn"
              @click="handlePostCommentButton">
            <spinner v-if="isCommentPosting" disabled/>
            <span v-else>Post</span>
          </button>
        </div>
      </div>
      <hr v-if="comments.length > 0">
      <div v-if="comments.length > 0" class="comment">
        <shader-comment
            v-for="(comment, index) in comments" :key="comment.id"
            :index="index"
            :comment="comment"
            :is-first="index === 0"
            :is-last="index === comments.length - 1"
            :shader-id="shaderId || 0"/>
      </div>
    </div>
  </div>
</template>

<script>
import ShaderComment from "@/pages/NewPage/ShaderComment.vue";
import Error from "@/components/Error.vue";
import {textareaHeightHandler} from "@/utils/textareaHeightHandler.js";

export default {
  name: "CommentsArea",
  components: {ShaderComment},
  props: {
    comments: {
      type: Array,
      required: true,
    },
    shaderId: {
      type: Number || null,
      required: true,
    }
  },
  data() {
    return {
      isCommentPosting: false,
      comment: "",
      API_URL: import.meta.env.VITE_API_URL,
    }
  },
  methods: {
    textAreaChanged(event) {
      const textarea = event.target;
      textareaHeightHandler(textarea);
    },
    handleCancelCommentButton() {
      this.comment = "";
    },
    handlePostCommentButton() {
      if (this.comment.length === 0) {
        console.log("Comment length cannot be 0")
        return;
      }

      this.isCommentPosting = true;

      fetch(`${this.API_URL}/shaders/${this.shaderId}/comment`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
        body: JSON.stringify({text: this.comment})
      }).then(response => {
        if (!response.ok) {
          throw new Error(response.text() || "Server returned an error");
        }
        return response.json();
      }).then(body => {
        this.comments.unshift(body);
        this.comment = '';
        this.$nextTick(() => {
          const textarea = this.$refs.commentInput;
          if (!textarea) return;
          textareaHeightHandler(textarea)
        });
      }).catch(error => {
        this.$refs.errorToast.show("Error posting comment");
      }).finally(() => {
        this.isCommentPosting = false;
      })
    },
  },
  mounted() {
    textareaHeightHandler(this.$refs.commentInput);
  }
}
</script>

<style scoped>
.comments-area-wrapper{
  margin-top: 10px;
}
.comments-area {
  background: #282C34;
  border-radius: 8px;
}

.comment-post {
  display: flex;
  flex-direction: column;
  padding: 14px;
  border: none;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.comment-input {
  background: transparent;
  font-size: large;
  cursor: text;
  color: lightgray;
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  overflow: hidden;
}

.comment-buttons {
  display: flex;
  margin-top: 8px;
  flex-direction: row;
  justify-content: end;
  gap: 4px;
}

.btn {
  align-self: flex-end;
  padding: 4px 8px;
  margin: auto 0 0 0;
  border-radius: 8px;
  background: transparent;
  font-size: large;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  color: lightgray;
}

.btn:hover {
  border: 1px solid lightgray;
}

.comment {
  background: #282C34;
  padding: 10px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;

  margin-bottom: 10px;
  color: lightgray;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  overflow: auto;
}

.comments-empty {
  margin-bottom: 10px;
}

hr {
  margin: 0 10px;
  border-top: 1px solid lightgrey;
}
</style>