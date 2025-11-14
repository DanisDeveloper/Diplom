<template>
  <div>
    <div class="shader-navigation-bar">
      <div class="shader-title-area">
        <input
            :disabled="!shaderOwnerIsMe && this.shader.id"
            maxlength="30"
            :class="{'disabled-input': !shaderOwnerIsMe && this.shader.id}"
            class="shader-title"
            placeholder="Title"
            v-model.trim="this.shader.title">
        <shader-metadata :shader="this.shader"/>
      </div>
      <div class="right-btns">
        <button
            class="gradient"
            v-tooltip="isSavingShader? 'Saving shader' : 'Save shader'"
            v-if="this.$store.state.auth.isAuth"
            @click="handleSaveButtonClick">
          <spinner v-if="isSavingShader" disabled/>
          <span v-show="!isSavingShader">Save</span>
        </button>

        <button @click="handleVisibilityButtonClick"
                class="icon-text-button"
                v-tooltip="this.shader.visibility ? 'Make shader private' : 'Make shader public'"
                v-if="this.$store.state.auth.isAuth && shaderOwnerIsMe">
          <spinner v-if="isChangingVisibility" disabled/>
          <unhide-icon v-else-if="this.shader.visibility" :color="'#282C34'"/>
          <hide-icon
              v-else
              :disabled="isChangingVisibility"
              :color="'#282C34'"
          />
        </button>
        <button @click="handleLikeButtonClick"
                class="icon-text-button"
                v-tooltip="isLiked ? 'Unlike shader' : 'Like shader'"
                v-if="this.$store.state.auth.isAuth && this.shader.id">
          <spinner v-if="isLoadingLike" disabled/>
          <like-icon
              v-else
              :disabled="isLoadingLike"
              :color="isLiked ? '#f44336' : '#282C34'"
          />
        </button>
        <button v-tooltip="'Fork shader'" class="icon-text-button"
                v-if="this.$store.state.auth.isAuth && this.shader.id" @click="handleForkButtonClick">
          <spinner v-if="isForkingShader" disabled/>
          <fork-icon v-else :color="'#282C34'"/>
        </button>
      </div>
    </div>
    <div class="main">
      <div class="canvas-container">
        <div class="shader-box">
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
        </div>
        <div class="canvas-footer">
          <div class="shader-metainfo-controls">
            <div class="shader-window-manage-btn">
              <icon-button v-tooltip="'Upload shader'" :class="{'btn-border-error': compileFailed}"
                           @click="uploadShader">
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
            </div>
            <shader-window-info
                class="shader-window-info"
                :accumulated-time="this.accumulatedTime"
                :canvas-height="this.canvasHeight"
                :canvas-width="this.canvasWidth"/>
          </div>
        </div>
        <comments-area
            v-if="this.$store.state.auth.isAuth"
            :comments="comments"
            :shader-id="this.shader?.id || 0"/>
      </div>
      <shader-editor
          v-model="this.shader.code"
          :errors="this.errorLog"
          class="shader-editor">
      </shader-editor>
    </div>
  </div>
</template>

<script>
import ShaderEditor from "@/pages/NewPage/ShaderEditor.vue";
import exampleShader from "@/shaders/example.js";
import {truncate} from "@/utils/truncate.js";
import Error from "@/components/Error.vue";
import ShaderWindowInfo from "@/pages/NewPage/ShaderWindowInfo.vue";
import {formatDate} from "@/utils/formatDate.js";
import ShaderComment from "@/pages/NewPage/ShaderComment.vue";
import ShaderMetadata from "@/pages/NewPage/ShaderMetadata.vue";
import CommentsArea from "@/pages/NewPage/CommentsArea.vue";
import UnhideIcon from "@/components/Icons/UnhideIcon.vue";
import {useToast} from "@/composables/useToast.js";


export default {
  setup() {
    const {show} = useToast();

    const notify = (message, isError = false) => {
      show(message, {duration: 3000, background: isError ? '#f10000' : '#4caf50'});
    };

    return {notify};
  },
  components: {
    UnhideIcon,
    CommentsArea,
    ShaderMetadata,
    ShaderComment,
    ShaderWindowInfo,
    ShaderEditor,
  },
  data() {
    return {
      serverError: false,

      tabs: ['Shader', 'Description', 'Comments'],
      activeTab: 'Shader',
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
        updatedAt: null,
        views: 0,
        user: {
          id: null,
          name: null
        },
        origin: null,
      },
      originShader: null,

      isLiked: false,
      user: '',

      comments: [],

      isChangingVisibility: false,
      isSavingShader: false,
      isForkingShader: false,
      isLoadingLike: false,
      isLoading: false,
    }
  },
  methods: {
    formatDate,
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
        this.notify("Shader compilation failed", true)
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
    handleSaveButtonClick() {
      // Проверка, что название не пустое
      if (this.shader.title.length === 0) {
        this.notify("Title must not be empty", true)
        return;
      }

      // Сохранение шейдера
      let requestBody = {
        title: this.shader.title,
        description: this.shader.description,
        code: this.shader.code,
        visibility: this.shader.visibility,
        originId: this.shader.origin?.id
      }

      if (this.shader.id === null)
        this.saveNewShader(requestBody);
      else if (this.shaderOwnerIsMe)
        this.updateCurrentShader(requestBody);
    },
    handleForkButtonClick() {
      // Проверка, что название не пустое
      if (this.shader.title.length === 0) {
        this.notify("Title must not be empty", true);
        return;
      }
      let requestBody = {
        title: this.shader.title,
        description: this.shader.description,
        code: this.shader.code,
        visibility: this.shader.visibility,
        originId: this.shader.id
      }
      this.forkShader(requestBody);
    },
    handleLikeButtonClick() {
      this.isLoadingLike = true;
      fetch(`${this.$store.state.api.API_URL}/shaders/${this.shader.id}/like`, {
        method: this.isLiked ? "DELETE" : "POST",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
      }).then(response => {
        if (response.ok) {
          this.isLiked = !this.isLiked;
        }
      }).catch(error => {
        this.notify("Error saving like", true);
      }).finally(() => {
        this.isLoadingLike = false;
      })
    },
    handleVisibilityButtonClick() {
      this.isChangingVisibility = true;
      fetch(`${this.$store.state.api.API_URL}/shaders/${this.shader.id}?visibility=${!this.shader.visibility}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
      }).then(response => {
        if (!response.ok) {
          throw new Error(response.text() || "Server returned an error");
        }
        this.shader.visibility = !this.shader.visibility;
      }).catch(error => {
        this.notify("Error saving like", true);
      }).finally(() => {
        this.isChangingVisibility = false;
      })
    },
    async saveNewShader(requestBody) {
      try {
        this.isSavingShader = true;
        const response = await fetch(`${this.$store.state.api.API_URL}/shaders`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });
        if (response.ok) {
          this.notify("Shader was created");
        }
        const body = await response.json();
        this.$router.push(`/new/${body.id}`);
      } catch (error) {
        this.notify("Error saving shader", true);
      } finally {
        this.isSavingShader = false;
      }
    },
    async updateCurrentShader(requestBody) {
      try {
        this.isSavingShader = true;
        const response = await fetch(`${this.$store.state.api.API_URL}/shaders/${this.shader.id}`, {
          method: "PUT",
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });
        if (response.ok) {
          this.notify("Shader was saved");
        }
      } catch (error) {
        this.notify("Error saving shader", true);
      } finally {
        this.isSavingShader = false;
      }
    },
    async forkShader(requestBody) {
      try {
        this.isForkingShader = true;

        const response = await fetch(`${this.$store.state.api.API_URL}/shaders`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          this.notify("Shader was saved");
        }

        const body = await response.json();
        this.$router.push(`/new/${body.id}`);
      } catch (error) {
        this.notify("Error saving shader", true);
      } finally {
        this.isForkingShader = false;
      }
    }
  },
  computed: {
    shaderOwnerIsMe() {
      return this.shader.user?.id === this.$store.state.auth.user.id
    },
  },
  mounted() {
    if (!this.$route.params.id) return;
    this.$store.commit("ui/setLoading", true);
    // Загрузка шейдера
    fetch(`${this.$store.state.api.API_URL}/shaders/${this.$route.params.id}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
      credentials: 'include',
    }).then(response => {
      if (!response.ok) {
        throw new Error(response.text() || "Server returned an error");
      }
      return response.json();
    }).then(shader => {
      Object.assign(this.shader, shader);
      this.uploadShader();
    }).catch(error => {
      this.$store.commit("ui/setError", error.status);
    }).finally(() => {
      this.$store.commit("ui/setLoading", false);
    })

    // загрузка лайка
    if (this.$store.state.auth.isAuth) {
      this.isLoadingLike = true
      fetch(`${this.$store.state.api.API_URL}/shaders/${this.$route.params.id}/like`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
      }).then(response => {
        if (!response.ok) {
          throw new Error(response.text() || "Server returned an error");
        }
        return response.json();
      }).then(isLiked => {
        this.isLiked = isLiked;
      }).catch(error => {
        this.notify("Error getting like status", true);
      }).finally(() => {
        this.isLoadingLike = false
      })
    }

    this.isLoadingComments = true // TODO реализовать анимацию загрузки комментариев
    fetch(`${this.$store.state.api.API_URL}/shaders/${this.$route.params.id}/comments`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    }).then(response => {
      if (!response.ok) {
        throw new Error(response.text() || "Server returned an error");
      }
      return response.json();
    }).then(comments => {
      this.comments = comments;
    }).catch(error => {
      this.notify("Error getting shader comments", true);
    }).finally(() => {
      this.isLoadingComments = false
    })
  },
}
</script>

<style scoped>
.shader-navigation-bar {
  display: flex;
  justify-content: start;
  align-items: center;
}

.main {
  display: flex;
  justify-content: space-between;
  margin: 0 0.5em;
  gap: 0.5em;
}

.canvas-container {
  box-sizing: border-box;
  flex: 1;
  font-family: 'JetBrains Mono', monospace;
}

.shader-box {
  width: 100%;
  aspect-ratio: 1.4 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shader-box .shader-window {
  width: 100%;
  height: 100%;
}

.shader-editor {
  flex: 1;
}

.shader-window :deep(canvas) {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.shader-window :deep(canvas:fullscreen) {
  border-radius: 0;
}

.right-btns {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-left: 0.25rem;
}

.canvas-footer {
  display: flex;
  width: 100%;
  background: #282C34;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;

}

.shader-window-manage-btn {
  display: flex;
  justify-content: flex-start;
  gap: 4px;
}

.shader-metainfo-controls {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  padding: 10px;
}

.shader-window-info {
  display: flex;
  margin-left: auto;
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

.shader-title-area {
  flex: 1;
  max-width: 50%;
  padding: 10px;
  border: 1px solid transparent;
  background: transparent;
  cursor: text;
  color: #282C34;
}

.shader-title {
  width: 100%;
  border: 1px solid transparent;
  background: transparent;
  font-size: x-large;
  cursor: text;
  color: #282C34;
}

.disabled-input {
  cursor: not-allowed;
}

.visibility-select option {
  background-color: #1e1e1e;
  color: lightgray;
}


h1, h3 {
  color: #282C34;
}

input, textarea {
  outline: none;
}

.icon-text-button {
  height: fit-content;
  display: flex;
  align-items: center;
  padding: 0.2rem;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  border-radius: 8px;
  gap: 4px;
}

.icon-text-button:hover {
  border: 1px solid #282c34;
  transform: scale(1.1) translateY(-2px);
}

</style>