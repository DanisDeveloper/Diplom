<template>
  <loader v-if="this.isLoading"></loader>
  <div v-else-if="this.isForbidden" class="forbidden-block">
    <forbidden-icon></forbidden-icon>
    <h1>You are not allowed to access this page</h1>
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
          <button class="action-btn" :class="{'btn-border-error': compileFailed}" @click="uploadShader">
            <upload-icon :color="compileFailed? 'red' : 'lightgrey'"></upload-icon>
          </button>
          <button v-if="isPaused" class="action-btn" @click="togglePause">
            <play-icon></play-icon>
          </button>
          <button v-else class="action-btn" @click="togglePause">
            <pause-icon></pause-icon>
          </button>
          <button class="action-btn" @click="resetTime">
            <restart-icon></restart-icon>
          </button>
          <button class="action-btn" @click="expandScreen">
            <expand-icon></expand-icon>
          </button>

          <div class="right-btns">
            <button v-if="isSavingLike" class="action-btn btn-saving" disabled>
              <div class="spinner"></div>
            </button>
            <button v-else v-if="this.$store.state.isAuth && this.id" class="action-btn">
              <like-icon
                  :color="isLiked ? 'red' : 'lightgrey'"
                  @click="handleLikeButtonClick"
              ></like-icon>
            </button>

            <button v-if="isSavingShader" class="action-btn btn-saving" disabled>
              <div class="spinner"></div>
            </button>
            <button v-else v-if="this.$store.state.isAuth" class="action-btn" @click="handleSaveOrForkButtonClick">
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
            :class="{'empty-title-error': titleEmpty}"
            class="shader-title"
            placeholder="Title"
            v-model.trim="title"
        >

        <textarea
            :disabled="!isStoreUser && this.id"
            oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px';"
            class="shader-description"
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
              <span class="link" @click="$router.push(`/new/${id_forked}`)">shader</span>
            </span>
            <span v-else-if="this.id">
              Created
            </span>
            <span v-if="this.id">
              by
              <span class="link" @click="$router.push(`/profile/${user_id}`)">{{ username }}</span>
              in {{ formattedDate }}
            </span>
          </div>
        </div>

      </div>
    </div>

    <shader-editor v-model="code" :errors="this.errorLog" class="shader-editor"></shader-editor>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import ShaderWindow from "@/components/ShaderWindow.vue";
import ShaderEditor from "@/components/ShaderEditor.vue";
import exampleShader from "@/shaders/example.js";
import FooterInfo from "@/components/AppFooter.vue";
import UploadIcon from "@/components/UI/UploadIcon.vue";
import RestartIcon from "@/components/UI/RestartIcon.vue";
import PlayIcon from "@/components/UI/PlayIcon.vue";
import PauseIcon from "@/components/UI/PauseIcon.vue";
import ExpandIcon from "@/components/UI/ExpandIcon.vue";
import DownIcon from "@/components/UI/DownIcon.vue";
import SaveIcon from "@/components/UI/SaveIcon.vue";
import UpIcon from "@/components/UI/UpIcon.vue";
import ForbiddenIcon from "@/components/UI/ForbiddenIcon.vue";
import Loader from "@/components/Loader.vue";
import ForkIcon from "@/components/UI/ForkIcon.vue";
import LikeIcon from "@/components/UI/LikeIcon.vue";

export default {
  components: {
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

      isLiked: false,
      username: '',

      isSavingShader: false,
      isSavingLike: false,
      isLoading: false,
      isForbidden: false,
    }
  },
  methods: {
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
        const response = await fetch('http://localhost:8000/shaders/', {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });
        // TODO убрать паузу
        await new Promise(resolve => setTimeout(resolve, 1000));
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
        const response = await fetch(`http://localhost:8000/likes/${this.id}/`, {
          method: this.isLiked ? "DELETE" : "POST",
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
        });
        await new Promise(resolve => setTimeout(resolve, 1000)); // TODO убрать
        if (response.ok) {
          this.isLiked = !this.isLiked;
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.isSavingLike = false;
      }
    }
  },
  computed: {
    isStoreUser() {
      return this.user_id === this.$store.state.user.id
    },
    formattedDate() {
      const date = new Date(this.created_at);

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    },
  },
  async mounted() {
    if (this.$route.params.id === undefined) return;
    this.isLoading = true
    try {
      const response = await fetch(`http://localhost:8000/shaders/${this.$route.params.id}/`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
      });
      if ([401, 403].includes(response.status)) {
        this.isForbidden = true;
        return;
      }
      const {shader, is_liked, username} = await response.json();
      console.log(is_liked)
      await new Promise(resolve => setTimeout(resolve, 1000)); // TODO убрать
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
      this.username = username
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

.action-btn {
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

.action-btn:hover {
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
  cursor: pointer;
  color: lightgray;
}


.shader-description {
  resize: none;
  overflow: hidden;

}

.visibility-select {
  margin-left: 10px;
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


.forbidden-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  margin-top: 100px;
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
</style>