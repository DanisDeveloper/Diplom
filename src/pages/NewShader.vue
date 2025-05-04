<template>
  <loader v-if="this.isLoading"></loader>
  <div v-else-if="this.isForbidden" class="error-page-block">
    <forbidden-icon></forbidden-icon>
    <h1>You are not allowed to access this page</h1>
  </div>
  <div v-else-if="this.isNotFound" class="error-page-block">
    <forbidden-icon></forbidden-icon>
    <h1>Shader was deleted or never existed</h1>
  </div>
  <div v-else class="main">
    <div class="canvas-container">
      <shader-window
          class="shader-window"
          ref="shaderWindow"
          :code="code"
          @frameWatch="frameWatch"
          @accumulatedTimeWatch="accumulatedTimeWatch"
          @canvasWidthWatch="canvasWidthWatch"
          @canvasHeightWatch="canvasHeightWatch"
          @compileFailedWatch="compileFailedWatch"
          @errorLogWatch="errorLogWatch"
      ></shader-window>

      <div class="canvas-footer">
        <div class="shader-info">
          <div class="shader-info__component"><strong>Frame:</strong> {{ this.frame }}</div>
          <div class="shader-info__component"><strong>Time:</strong> {{ accumulatedTime.toFixed(2) }}</div>
          <div class="shader-info__component"><strong>Resolution:</strong> {{ canvasWidth }}x{{ canvasHeight }}</div>
        </div>
        <hr>
        <div class="btns">
          <button class="action-icon-btn" :class="{'btn-border-error': compileFailed}" @click="uploadShader">
            <upload-icon :color="compileFailed? 'red' : 'lightgrey'"></upload-icon>
          </button>
          <button v-if="isPaused" class="action-icon-btn" @click="togglePause">
            <play-icon></play-icon>
          </button>
          <button v-else class="action-icon-btn" @click="togglePause">
            <pause-icon></pause-icon>
          </button>
          <button class="action-icon-btn" @click="resetTime">
            <restart-icon></restart-icon>
          </button>
          <button class="action-icon-btn" @click="expandScreen">
            <expand-icon></expand-icon>
          </button>

          <div class="right-btns">
            <button v-if="isSavingLike" class="action-icon-btn btn-saving" disabled>
              <div class="spinner"></div>
            </button>
            <button v-else v-if="this.$store.state.isAuth && this.id" class="action-icon-btn">
              <like-icon
                  :color="isLiked ? 'red' : 'lightgrey'"
                  @click="handleLikeButtonClick"
              ></like-icon>
            </button>

            <button v-if="isSavingShader" class="action-icon-btn btn-saving" disabled>
              <div class="spinner"></div>
            </button>
            <button v-else v-if="this.$store.state.isAuth" class="action-icon-btn" @click="handleSaveOrForkButtonClick">
              <save-icon v-if="isStoreUser || this.id === null"></save-icon>
              <fork-icon v-else></fork-icon>
            </button>
          </div>
        </div>
      </div>

      <div class="description-area">
        <input
            :disabled="!isStoreUser && this.id"
            maxlength="50"
            :class="{'empty-title-error': titleEmpty, 'disabled-input': !isStoreUser && this.id}"
            class="shader-title"
            placeholder="Title"
            v-model.trim="title"
        >

        <textarea
            :disabled="!isStoreUser && this.id"
            @change="textareaHeightHandler"
            @input="textareaHeightHandler"
            class="shader-description"
            :class="{'disabled-input': !isStoreUser && this.id}"
            placeholder="Description"
            v-model.trim="description">
        </textarea>

        <div v-if="this.id !== null || this.$store.state.isAuth" class="shader-description__bottom">
          <div class="shader-visibility">
            <label v-if="isStoreUser || (this.id === null && this.$store.state.isAuth)">
              Visibility:
              <select v-model="visibility" class="visibility-select">
                <option :value="true">Public</option>
                <option :value="false">Private</option>
              </select>
            </label>
          </div>

          <div class="shader-metadata">
            <span v-if="this.id && id_forked">
              forked from
              <span class="link" @click="$router.push(`/new/${id_forked}`)">{{truncate(forked_shader ? forked_shader['title'] : "")}}</span>
            </span>
            <span v-else-if="this.id">
              Created
            </span>
            <span v-if="this.id">
              by
              <span class="link" @click="$router.push(`/profile/${user_id}`)">{{ username }}</span>
              in {{ this.formatDate(this.created_at) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="this.id || this.comments.length > 0" class="comments-area">
        <h3>Comments ({{this.comments.length}})</h3>
        <div v-if="this.$store.state.isAuth">
          <textarea
              @change="textareaHeightHandler"
              @input="textareaHeightHandler"
              class="comment-post"
              placeholder="Your comment..."
              v-model.trim="comment">
          </textarea>
          <button v-if="isCommentPosting" class="post-btn btn-saving" disabled>
            <div class="spinner"></div>
          </button>
          <button v-else :disabled="isCommentPosting" class="post-btn" @click="postComment">Post</button>
        </div>
        <div v-for="comment in comments" :key="comment['id']" class="comment">
          <img
              class="comment__avatar"
              width="40"
              height="40"
              :src="`${this.API_URL}/public/${comment['avatar_url'] ? comment['avatar_url'] : 'avatars/avatar.png'}`"
              @click="$router.push(`/profile/${comment['user_id']}`)"
              alt="avatar">
          <button v-if="isSavingHiddenState && comment['id'] === commentToHide" class="comment__hide btn-saving" disabled>
            <div class="spinner"></div>
          </button>
          <div v-else v-if="this.$store.state.user.id === comment['user_id']" class="comment__hide">
            <unhide-icon :width="24" :height="24" v-if="comment['hidden']" @click="handleHideButton(comment)"></unhide-icon>
            <hide-icon :width="24" :height="24" v-else @click="handleHideButton(comment)"></hide-icon>
          </div>
          <div class="comment__header">
            <span @click="$router.push(`/profile/${comment['user_id']}`)" class="link">
              {{ comment['username'] }}
            </span>
            in {{ this.formatDate(comment['created_at']) }}
          </div>

          <div class="comment__content">
            {{ comment['text'] }}
          </div>
        </div>
      </div>
    </div>

    <shader-editor
        v-model="code"
        :errors="this.errorLog"
        class="shader-editor">
    </shader-editor>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import ShaderWindow from "@/components/ShaderWindow.vue";
import ShaderEditor from "@/components/ShaderEditor.vue";
import exampleShader from "@/shaders/example.js";
import FooterInfo from "@/components/AppFooter.vue";
import UploadIcon from "@/components/UI/Icons/UploadIcon.vue";
import RestartIcon from "@/components/UI/Icons/RestartIcon.vue";
import PlayIcon from "@/components/UI/Icons/PlayIcon.vue";
import PauseIcon from "@/components/UI/Icons/PauseIcon.vue";
import ExpandIcon from "@/components/UI/Icons/ExpandIcon.vue";
import DownIcon from "@/components/UI/Icons/DownIcon.vue";
import SaveIcon from "@/components/UI/Icons/SaveIcon.vue";
import UpIcon from "@/components/UI/Icons/UpIcon.vue";
import ForbiddenIcon from "@/components/UI/Icons/ForbiddenIcon.vue";
import Loader from "@/components/Loader.vue";
import ForkIcon from "@/components/UI/Icons/ForkIcon.vue";
import LikeIcon from "@/components/UI/Icons/LikeIcon.vue";
import HideIcon from "@/components/UI/Icons/HideIcon.vue";
import UnhideIcon from "@/components/UI/Icons/UnhideIcon.vue";
import truncate from "@/utils/truncate.js";


export default {
  components: {
    UnhideIcon,
    HideIcon,
    LikeIcon,
    ForkIcon,
    Loader,
    ForbiddenIcon,
    UpIcon,
    SaveIcon,
    DownIcon,
    ExpandIcon,
    PauseIcon,
    PlayIcon,
    RestartIcon,
    UploadIcon,
    FooterInfo,
    ShaderEditor,
    ShaderWindow,
    NavBar
  },
  data() {
    return {
      // Переменные shader-window
      code: this.$route.query.code || exampleShader,
      isPaused: false,
      frame: 0,
      accumulatedTime: 0,
      canvasWidth: 0,
      canvasHeight: 0,
      compileFailed: false,
      errorLog: [],

      // TODO перенести все это в один объект (это все информация о шейдере)
      id: null,
      title: "",
      description: "",
      titleEmpty: false,
      visibility: true,
      created_at: null,
      updated_at: null,
      user_id: null,
      id_forked: null,
      forked_shader: null,

      isLiked: false,
      username: '',

      comments: [],
      comment: '',
      isCommentPosting: false,
      isSavingHiddenState: false,
      commentToHide: null,

      isSavingShader: false,
      isSavingLike: false,
      isLoading: false,
      isForbidden: false,
      isNotFound: false,

      API_URL: import.meta.env.VITE_API_URL,

    }
  },
  methods: {
    truncate,
    frameWatch(frame) {
      this.frame = frame
    },
    accumulatedTimeWatch(time) {
      this.accumulatedTime = time;
    },
    canvasWidthWatch(width) {
      this.canvasWidth = width;
    },
    canvasHeightWatch(height) {
      this.canvasHeight = height;
    },
    compileFailedWatch(failed) {
      this.compileFailed = failed;
    },
    errorLogWatch(log) {
      this.errorLog = log;
    },

    uploadShader() {
      this.$refs.shaderWindow.uploadShader();
    },
    togglePause() {
      this.isPaused = !this.isPaused;
      this.$refs.shaderWindow.togglePause();
    },
    resetTime() {
      this.$refs.shaderWindow.resetTime();
    },
    expandScreen() {
      this.$refs.shaderWindow.expandScreen();
    },
    async handleSaveOrForkButtonClick() {
      // Проверка, что название не пустое
      if (this.title.length === 0) {
        this.titleEmpty = true;
        clearTimeout(this.timeoutId)
        this.timeoutId = setTimeout(() => {
          this.titleEmpty = false;
        }, 1000);
        return;
      }

      // Сохранение шейдера
      this.isSavingShader = true;
      try {
        let requestBody = null
        if (this.isStoreUser) {
          requestBody = {
            id: this.id,
            title: this.title,
            description: this.description,
            code: this.code,
            visibility: this.visibility,
            id_forked: null,
          };
        } else {
          requestBody = {
            id: null,
            title: this.title,
            description: this.description,
            code: this.code,
            visibility: this.visibility,
            id_forked: this.id,
          };
        }
        const response = await fetch(`${this.API_URL}/shaders/`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });
        const body = await response.json();
        if (!this.isStoreUser || this.id === null) {
          this.$router.push(`/new/${body.id}/`);
        }
      } catch (error) {
        // TODO сделать вывод ошибки на экран
        console.log(error);
      } finally {
        this.isSavingShader = false;
      }
    },
    async handleLikeButtonClick() {
      this.isSavingLike = true;
      try {
        const response = await fetch(`${this.API_URL}/likes/${this.id}/`, {
          method: this.isLiked ? "DELETE" : "POST",
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
        });
        if (response.ok) {
          this.isLiked = !this.isLiked;
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.isSavingLike = false;
      }
    },
    async postComment() {
      if (this.comment.length === 0) return;
      this.isCommentPosting = true;
      try {
        const response = await fetch(`${this.API_URL}/comments/${this.id}`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
          body: JSON.stringify({text: this.comment})
        });
        const body = await response.json();
        this.comments.unshift(body);
        this.comment = '';
      } catch (error) {
        console.log(error);
      } finally {
        this.isCommentPosting = false;
      }
    },
    async handleHideButton(comment) {
      this.isSavingHiddenState = true;
      this.commentToHide = comment['id'];
      try {
        const response = await fetch(`${this.API_URL}/comments/${comment.id}/`, {
          method: "PATCH",
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
          body: JSON.stringify({hidden: !comment['hidden']})
        });

        const body = await response.json();
        console.log(comment);
        console.log(body);
        Object.assign(comment, body);
      } catch (error) {
        console.log(error);
      }finally{
        this.isSavingHiddenState = false;
        this.commentToHide = null;
      }
    },
    textareaHeightHandler(event) {
      // TODO доделать, чтобы высота возвращалась
      const textarea = event.target;
      textarea.style.height = '';
      textarea.style.height = textarea.scrollHeight + 'px';
    },
    formatDate(date) {
      const _date = new Date(date);

      const day = String(_date.getDate()).padStart(2, '0');
      const month = String(_date.getMonth() + 1).padStart(2, '0');
      const year = _date.getFullYear();

      return `${day}-${month}-${year}`;
    },
  },
  computed: {
    isStoreUser() {
      return this.user_id === this.$store.state.user.id
    },
  },
  async mounted() {
    if (this.$route.params.id === undefined) return;
    this.isLoading = true
    try {
      const response = await fetch(`${this.API_URL}/shaders/${this.$route.params.id}/`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
      });
      if ([401, 403].includes(response.status)) {
        this.isForbidden = true;
        return;
      }else if(response.status === 404){
        this.isNotFound = true;
        return;
      }
      const {shader, is_liked, username, forked_shader ,comments} = await response.json();
      this.forked_shader = forked_shader;
      this.id = shader.id;
      this.title = shader.title;
      this.description = shader.description;
      this.code = shader.code;
      this.visibility = shader.visibility;
      this.created_at = shader.created_at;
      this.updated_at = shader.updated_at;
      this.user_id = shader.user_id;
      this.id_forked = shader.id_forked;
      this.isLiked = is_liked;
      this.username = username;
      this.comments = comments;
      console.log(this.comments);
      // ждём, пока Vue применит все изменения, и только потом обновляем шейдер
      this.uploadShader();
    } catch (error) {
      // TODO сделать обработку ошибок
      console.log(error)
    } finally {
      this.isLoading = false
    }
  },
}
</script>

<style scoped>

.main {
  display: flex;
  justify-content: space-between;
}

.canvas-container {
  margin-top: 10px;
  margin-left: 10px;
  flex: 1;
  font-family: 'JetBrains Mono', monospace;
}

.shader-editor {
  flex: 1;
}

.shader-window :deep(canvas) {
  border-radius: 10px;
}

.shader-window :deep(canvas:fullscreen) {
  border-radius: 0;
}

.btns {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  margin-top: 10px;
}

.action-icon-btn {
  background: transparent;
  border-radius: 8px;
  border: 1px solid #282C34;
  font-size: large;
  color: lightgray;
  cursor: pointer;
  display: flex;
  margin: 0 5px;
  align-items: center;
  justify-content: center;
  transition: border 0.2s ease, color 0.2s ease;
  width: 36px; /* подберите под свой SaveIcon + паддинги */
  height: 36px; /* чтоб и по высоте не прыгало */
}

.action-icon-btn:hover {
  color: white;
  border: 1px solid lightgray;
}

.right-btns {
  display: flex;
  margin-left: auto;
}

.shader-info__component {
  display: inline-block;
  margin-right: 10px;
  color: lightgray;
}

.shader-info {
  display: flex;
  justify-content: flex-start;
}

.canvas-footer {
  margin: 10px 0;
  padding: 10px;
  width: 100%;
  background: #282C34;
  border-radius: 8px;
}

.btn-border-error {
  border: 1px solid red !important;
}

hr {
  margin-top: 10px;
  width: 100%;
  color: lightgray;
}

.description-area {
  width: 100%;
  background: #282C34;
  margin: 10px 0;
  border-radius: 8px;
  border: 2px solid transparent;
  padding: 10px;
  color: lightgray;
  display: flex;
  flex-direction: column;
}

.shader-title, .shader-description {
  padding: 10px;
  margin: 10px;
  border: 1px solid lightgray;
  border-radius: 8px;
  background: transparent;
  font-size: large;
  cursor: text;
  color: lightgray;
}


.shader-description {
  resize: none;
  overflow: hidden;

}

.disabled-input {
  cursor: not-allowed;
}

.visibility-select {
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #282C34;
  background: transparent;
  color: lightgray;
  font-size: large;
  cursor: pointer;
  appearance: none; /* убираем дефолтные стрелки */
  transition: border 0.2s ease, color 0.2s ease;
}

.visibility-select:hover {
  border-color: lightgray;
  color: white;
}

.shader-visibility {
  color: lightgray;
  font-size: large;
  display: flex;
  align-items: center;
  width: fit-content;
}

.visibility-select option {
  background-color: #1e1e1e;
  color: lightgray;
}

.empty-title-error {
  border: 2px solid red !important;
}


.btn-saving {
  /* можно переопределить цвета, если нужно */
  color: lightgray;
  border-color: #282C34;
  cursor: default;
  position: relative;
}

/* Сам спиннер внутри кнопки */
.btn-saving .spinner {
  width: 24px;
  height: 24px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  /* центрируем внутри кнопки */
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


.error-page-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  margin-top: 100px;
  color: #282C34;
}

.shader-metadata {
  margin-left: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  white-space: nowrap;
}

.link {
  font-weight: bold;
}

.link:hover {
  text-decoration: underline;
  cursor: pointer;
}

.shader-description__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px;
}


.comments-area{
  margin-bottom: 10px;
}

.comment-post {
  padding: 10px;
  border: 1px solid lightgray;
  border-radius: 8px;
  background: #282C34;
  font-size: large;
  cursor: text;
  color: lightgray;
  width: 100%;
  resize: none;
  overflow: hidden;
  min-height: 100px;
}

.post-btn {
  display: flex;
  padding: 4px 24px;
  margin: 0 0 0 auto;
  border-radius: 8px;
  background: transparent;
  font-size: large;
  cursor: pointer;
  color: #282C34;
  transition: all 0.3s ease;
  border: 1px solid #282C34;
}

.post-btn:hover {
  background: #282C34;
  color: lightgray;
}

.comment {
  background: #282C34;
  padding: 10px;
  border-radius: 8px;
  margin: 10px 0;
  color: lightgray;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  overflow: auto;

}

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

h1, h3{
  color: #282C34;
}
</style>