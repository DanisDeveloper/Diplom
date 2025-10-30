<template>
  <loader v-if="this.isLoading"></loader>
  <div v-else-if="this.isError" class="error-page-block">
    <error :status="this.errorStatus"></error>
  </div>
  <div v-else class="main">
    <toast ref="errorToast"/>
    <toast :background="'#282C34'" ref="generalToast"/>
    <div class="canvas-container">
      <shader-window
          class="shader-window"
          ref="shaderWindow"
          :code="this.shader.code"
          @frameWatch="frameWatch"
          @accumulatedTimeWatch="accumulatedTimeWatch"
          @canvasWidthWatch="canvasWidthWatch"
          @canvasHeightWatch="canvasHeightWatch"
          @compileFailedWatch="compileFailedWatch"
          @errorLogWatch="errorLogWatch"
      />

      <div class="canvas-footer">
        <div class="shader-info">
          <div class="shader-info__component"><strong>Frame:</strong> {{ this.frame }}</div>
          <div class="shader-info__component"><strong>Time:</strong> {{ accumulatedTime.toFixed(2) }}</div>
          <div class="shader-info__component"><strong>Resolution:</strong> {{ canvasWidth }}x{{ canvasHeight }}</div>
        </div>
        <hr>
        <div class="shader-window-manage-btn">
          <icon-button v-tooltip="'Upload shader'" :class="{'btn-border-error': compileFailed}" @click="uploadShader">
            <upload-icon :color="compileFailed? '#f44336' : 'lightgrey'"/>
          </icon-button>
          <icon-button v-if="isPaused" v-tooltip="'Start shader'" @click="togglePause">
            <play-icon/>
          </icon-button>
          <icon-button v-else v-tooltip="'Stop shader'" @click="togglePause">
            <pause-icon/>
          </icon-button>
          <icon-button v-tooltip="'Reset time'" @click="resetTime">
            <restart-icon/>
          </icon-button>
          <icon-button v-tooltip="'Expand screen'" @click="expandScreen">
            <expand-icon/>
          </icon-button>

          <div class="right-btns">
            <icon-button v-tooltip="'Saving like'" v-if="this.$store.state.isAuth && this.shader.id">
              <spinner v-if="isLoadingLike" disabled/>
              <like-icon
                  v-else
                  :disabled="isLoadingLike"
                  :color="isLiked ? '#f44336' : 'lightgrey'"
                  @click="handleLikeButtonClick"
              />
            </icon-button>
            <icon-button v-if="this.$store.state.isAuth" :class="{'btn-border-error': isTitleEmpty}"
                         @click="handleSaveOrForkButtonClick">
              <spinner
                  v-if="isSavingShader"
                  v-tooltip="'Saving shader'"
                  disabled/>
              <save-icon
                  v-else-if="shaderOwnerIsMe || this.shader.id === null"
                  v-tooltip="'Save shader'"
                  :color="isTitleEmpty? '#f44336' : 'lightgrey'"/>
              <fork-icon
                  v-else
                  v-tooltip="'Fork shader'"/>
            </icon-button>
          </div>
        </div>
      </div>

      <div class="description-area">
        <input
            :disabled="!shaderOwnerIsMe && this.shader.id"
            maxlength="50"
            :class="{'empty-title-error': isTitleEmpty, 'disabled-input': !shaderOwnerIsMe && this.shader.id}"
            class="shader-title"
            placeholder="Title"
            v-model.trim="this.shader.title"
        >
        <textarea
            :disabled="!shaderOwnerIsMe && this.shader.id"
            @change="textareaHeightHandler"
            @input="textareaHeightHandler"
            class="shader-description"
            :class="{'disabled-input': !shaderOwnerIsMe && this.shader.id}"
            placeholder="Description"
            v-model.trim="this.shader.description"></textarea>

        <div v-if="this.shader.id !== null || this.$store.state.isAuth" class="shader-description__bottom">
          <div class="shader-visibility">
            <label v-if="shaderOwnerIsMe || (this.shader.id === null && this.$store.state.isAuth)">
              Visibility:
              <select v-model="shader.visibility" class="visibility-select">
                <option :value="true">Public</option>
                <option :value="false">Private</option>
              </select>
            </label>
          </div>

          <div class="shader-metadata">
            <span v-if="this.shader.id && this.shader.originId">
              forked from
              <span class="link"
                    @click="$router.push(`/new/${this.shader.originId}`)">{{
                  truncate(this.shader.origin?.title ? this.shader.origin.title : "")
                }}</span>
            </span>
            <span v-else-if="this.shader.id">
              Created
            </span>
            <span v-if="this.shader.id">
              by
              <span class="link" @click="$router.push(`/profile/${shader.user.id}`)">{{ this.shader.user.name }}</span>
              in {{ this.formatDate(this.shader.createdAt) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="this.shader.id || this.comments.length > 0" class="comments-area">
        <h3>Comments ({{ this.comments.length }})</h3>
        <div v-if="this.$store.state.isAuth">
          <textarea
              @change="textareaHeightHandler"
              @input="textareaHeightHandler"
              class="comment-post"
              placeholder="Your comment..."
              v-model.trim="comment">
          </textarea>
          <button
              :disabled="isCommentPosting"
              class="post-btn"
              @click="handlePostCommentButton">
            <spinner v-if="isCommentPosting" disabled/>
            <span v-else>Post</span>
          </button>
        </div>

        <div v-for="(comment, index) in comments" :key="comment.id" class="comment">
          <img
              class="comment__avatar"
              width="40"
              height="40"
              :src="`${this.API_URL}/public/${comment.user.avatar_url ? comment.user.avatar_url : 'avatars/avatar.png'}`"
              @click="$router.push(`/profile/${comment.user.name}`)"
              alt="avatar">
          <icon-button v-if="this.$store.state.user.id === comment.user.id" class="comment__hide">
            <spinner
                v-if="isSavingHiddenState && comment.id === commentToHide"
                disabled/>
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
            in {{ this.formatDate(comment.createdAt) }}
          </div>
          <div class="comment__content">
            {{ !comment.hidden ? comment.text : "" }}
          </div>
        </div>
      </div>
    </div>

    <shader-editor
        v-model="this.shader.code"
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
import toast from "@/components/Toast.vue";
import NotFoundPage from "@/components/UI/Icons/StatusCodeIcon.vue";
import StatusCodeIcon from "@/components/UI/Icons/StatusCodeIcon.vue";
import IconButton from "@/components/UI/IconButton.vue";
import Spinner from "@/components/UI/Spinner.vue";
import Error from "@/components/Error.vue";


export default {
  components: {
    Error,
    Spinner,
    IconButton,
    StatusCodeIcon,
    NotFoundPage,
    toast,
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
      serverError: false,

      // Переменные shader-window

      isPaused: false,
      frame: 0,
      accumulatedTime: 0,
      canvasWidth: 0,
      canvasHeight: 0,
      compileFailed: false,
      errorLog: [],

      shader: {
        id: null,
        title: "",
        description: "",
        code: this.$route.query.code || exampleShader,
        visibility: true,
        createdAt: null,
        updated_at: null,
        user: {
          id: null,
          name: null
        },
        origin: null,
      },
      isTitleEmpty: false,
      originShader: null,

      isLiked: false,
      user: '',

      comments: [],
      comment: '',
      isCommentPosting: false,
      isSavingHiddenState: false,
      commentToHide: null,

      isSavingShader: false,
      isLoadingLike: false,
      isLoading: false,
      isError: false,
      errorStatus: 0,

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
      if (failed) {
        this.$refs.errorToast.show("Shader compilation failed")
        this.compileFailed = true;
        clearTimeout(this.updloadErrorTimeoutId);
        this.updloadErrorTimeoutId = setTimeout(() => {
          this.compileFailed = false;
        }, 1000);
      }
    },
    errorLogWatch(log) {
      this.errorLog = log;
    },
    uploadShader() {
      this.$refs.shaderWindow?.uploadShader();
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
    handleSaveOrForkButtonClick() {
      // Проверка, что название не пустое
      if (this.shader.title.length === 0) {
        this.isTitleEmpty = true;
        this.$refs.errorToast.show("Title must not be empty");
        clearTimeout(this.titleEmptyTimeoutId)
        this.titleEmptyTimeoutId = setTimeout(() => {
          this.isTitleEmpty = false;
        }, 1000);
        return;
      }

      // Сохранение шейдера
      let requestBody = {
        title: this.shader.title,
        description: this.shader.description,
        code: this.shader.code,
        visibility: this.shader.visibility,
        originId: (this.shaderOwnerIsMe) ? this.shader.origin?.id : this.shader.id
      }
      console.log(this.shader)

      if (this.shader.id === null)
        this.saveNewShader(requestBody);
      else if (this.shaderOwnerIsMe)
        this.updateCurrentShader(requestBody);
      else {
        this.forkShader(requestBody);
      }

    },
    handleLikeButtonClick() {
      this.isLoadingLike = true;
      fetch(`${this.API_URL}/shaders/${this.shader.id}/like`, {
        method: this.isLiked ? "DELETE" : "POST",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
      }).then(response => {
        if (response.ok) {
          this.isLiked = !this.isLiked;
        }
      }).catch(error => {
        this.$refs.errorToast.show("Error saving like");
      }).finally(() => {
        this.isLoadingLike = false;
      })
    },
    handlePostCommentButton() {
      if (this.comment.length === 0) {
        this.$refs.errorToast.show("Comment cannot be empty");
        return;
      }

      this.isCommentPosting = true;

      fetch(`${this.API_URL}/shaders/${this.shader.id}/comment`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
        body: JSON.stringify({text: this.comment})
      }).then(response => {
        if (!response.ok) {
          this.$refs.errorToast.show("Error posting comment");
        }
        return response.json();
      }).then(body => {
        this.comments.unshift(body);
        this.comment = '';
      }).catch(error => {
        this.$refs.errorToast.show("Error posting comment");

      }).finally(() => {
        this.isCommentPosting = false;
      })
    },
    handleHideButton(comment, index) {
      this.isSavingHiddenState = true;
      this.commentToHide = comment.id;

      fetch(`${this.API_URL}/shaders/${this.shader.id}/comments/${comment.id}?hidden=${!comment.hidden}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        credentials: 'include'
      }).then(response => {
        if (!response.ok) {
          this.$refs.errorToast.show("Error hiding comment");
        }
        comment.hidden = !comment.hidden;
      }).catch(error => {
        this.$refs.errorToast.show("Error hiding comment");
      }).finally(() => {
        this.isSavingHiddenState = false;
        this.commentToHide = null;
      })
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
    async saveNewShader(requestBody) {
      try {
        this.isSavingShader = true;
        const response = await fetch(`${this.API_URL}/shaders`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });
        if (response.ok) {
          this.$refs.generalToast.show("Shader was created");
        }
        const body = await response.json();
        this.$router.push(`/new/${body.id}`);
      } catch (error) {
        this.$refs.errorToast.show("Error saving shader");
      } finally {
        this.isSavingShader = false;
      }
    },
    async updateCurrentShader(requestBody) {
      try {
        this.isSavingShader = true;
        const response = await fetch(`${this.API_URL}/shaders/${this.shader.id}`, {
          method: "PUT",
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });
        if (response.ok) {
          this.$refs.generalToast.show("Shader was saved");
        }
      } catch (error) {
        this.$refs.errorToast.show("Error saving shader");
      } finally {
        this.isSavingShader = false;
      }
    },
    async forkShader(requestBody) {
      try {
        this.isSavingShader = true;

        const response = await fetch(`${this.API_URL}/shaders`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          this.$refs.generalToast.show("Shader was saved");
        }

        const body = await response.json();
        this.$router.push(`/new/${body.id}`);
      } catch (error) {
        this.$refs.errorToast.show("Error saving shader");
      } finally {
        this.isSavingShader = false;
      }
    }
  }
  ,
  computed: {
    shaderOwnerIsMe() {
      return this.shader.user?.id === this.$store.state.user.id
    }
    ,
  }
  ,
  mounted() {
    if (!this.$route.params.id) return;
    this.isLoading = true
    // Загрузка шейдера
    fetch(`${this.API_URL}/shaders/${this.$route.params.id}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
      credentials: 'include',
    }).then(response => {
      if (!response.ok) {
        this.isError = true
        this.errorStatus = response.status;
        return
      }
      return response.json();
    }).then(json => {
      this.shader = json;
      this.uploadShader();
    }).catch(error => {
      this.isError = true
    }).finally(() => {
      this.isLoading = false
    })

    // загрузка лайка
    this.isLoadingLike = true
    fetch(`${this.API_URL}/shaders/${this.$route.params.id}/like`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
      credentials: 'include',
    }).then(response => {
      if (!response.ok) {
        this.$refs.errorToast.show("Error getting like status");
      }
      return response.json();
    }).then(isLiked => {
      this.isLiked = isLiked;
    }).catch(error => {
      this.$refs.errorToast.show("Error getting like status");
    }).finally(() => {
      this.isLoadingLike = false
    })

    this.isLoadingComments = true // TODO реализовать анимацию загрузки комментариев
    fetch(`${this.API_URL}/shaders/${this.$route.params.id}/comments`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    }).then(response => {
      if (!response.ok) {
        this.$refs.errorToast.show("Error getting shader comments");
      }
      return response.json();
    }).then(body => {
      this.comments = body;
    }).catch(error => {
      this.$refs.errorToast.show("Error getting shader comments");
    }).finally(() => {
      this.isLoadingComments = false
    })
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

.shader-window-manage-btn {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  margin-top: 10px;
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
  border: 1px solid #f44336 !important;
}

hr {
  margin-top: 10px;
  width: 100%;
  color: lightgray;
  border: 1px solid lightgray;
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
  padding: 4px 8px;
  border-radius: 0.5rem;
  border: 1px solid #282C34;
  background: transparent;
  color: lightgray;
  font-size: inherit;
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
  display: block;
  align-items: center;
  width: fit-content;
  font-family: inherit;
}

.visibility-select option {
  background-color: #1e1e1e;
  color: lightgray;
}

.empty-title-error {
  border: 1px solid #f44336 !important;
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
  font-size: smaller;
}


.shader-description__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px;
}

.comments-area {
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

h1, h3 {
  color: #282C34;
}

input, textarea {
  outline: none;
}
</style>