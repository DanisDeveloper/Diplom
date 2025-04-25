<template>
<!--  <div v-if="this.isLoading" class="loader-wrapper">-->
<!--    <div class="smartglass-loader">-->
<!--      <div class="arc arc1"></div>-->
<!--      <div class="arc arc2"></div>-->
<!--      <div class="arc arc3"></div>-->
<!--    </div>-->
<!--  </div>-->
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
            <button v-if="!isExpanded" :class="{'btn-border-error': !isExpanded && titleEmpty}" class="action-btn"
                    @click="isExpanded = !isExpanded">
              <down-icon :fill="!isExpanded && titleEmpty ? 'red' : 'lightgrey'"></down-icon>
            </button>
            <button v-else class="action-btn" @click="isExpanded = !isExpanded">
              <up-icon></up-icon>
            </button>
            <button v-if="isSaving" class="action-btn btn-saving" disabled>
              <div class="spinner"></div>
            </button>
            <button v-else v-if="this.$store.state.isAuth" class="action-btn" @click="handleSaveButtonClick">
              <save-icon></save-icon>
            </button>
          </div>
        </div>
      </div>

      <div v-if="isExpanded" class="description-area">
        <input :class="{'empty-title-error': titleEmpty}" class="shader-title" placeholder="Title" v-model.trim="title">
        <textarea
            oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px';"
            class="shader-description"
            placeholder="Description"
            v-model.trim="description"></textarea>
<!--    TODO сделать join, чтобы получить имя пользователя, который создал шейдер    <label>created by </label>-->
<!--      TODO также добавить поле с датой туда типа created <username> in <date>  -->
<!--        TODO также добавить количество лайков-->
        <label v-if="this.$store.state.isAuth" class="shader-visibility">
          Visibility:
          <select v-model="visibility" class="visibility-select">
            <option :value="true">Public</option>
            <option :value="false">Private</option>
          </select>
        </label>
      </div>

      <div v-if="this.errorLog.length > 0" class="error-area" :class="{'error-area-border-error': compileFailed}">
        <h2 class="error-log-title">Error log</h2>
        <p class="error-line" v-for="error in this.errorLog">
          <span v-html="error"></span>
        </p>
      </div>
    </div>

    <shader-editor v-model="code" class="shader-editor"></shader-editor>
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

export default {
  components: {
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
      isExpanded: false,

      id: null,
      title: "",
      description: "",
      titleEmpty: false,
      visibility: true,
      created_at: null,
      updated_at: null,
      user_id: null,

      isSaving: false,
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
    async handleSaveButtonClick() {
      if (this.title.length === 0) {
        this.titleEmpty = true;
        clearTimeout(this.timeoutId)
        this.timeoutId = setTimeout(() => {
          this.titleEmpty = false;
        }, 1000);
        return;
      }

      this.isSaving = true;
      try {
        const response = await fetch('http://localhost:8000/shaders', {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
          body: JSON.stringify({
            id: this.id,
            title: this.title,
            description: this.description,
            code: this.code,
            visibility: this.visibility,
          })
        });
        // TODO убрать паузу
        await new Promise(resolve => setTimeout(resolve, 1000));
        const body = await response.json();
        this.id = body.id;
        this.title = body.title;
        this.description = body.description;
        this.code = body.code;
        this.visibility = body.visibility;
        this.created_at = body.created_at;
        this.updated_at = body.updated_at;
        this.user_id = body.user_id;
        this.$router.push(`/new/${body.id}`); // просто, чтобы было
        // console.log(body);
      } catch (error) {
        // TODO сделать вывод ошибки на экран

        console.log(error);
      } finally {
        this.isSaving = false;
      }
    }
  },
  async mounted() {
    if (this.$route.params.id === undefined) return;
    this.isLoading = true
    try {
      const response = await fetch(`http://localhost:8000/shaders/${this.$route.params.id}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
      });
      if ([401, 403].includes(response.status)) {
        this.isForbidden = true;
        return;
      }
      const body = await response.json();
      await new Promise(resolve => setTimeout(resolve, 1000)); // TODO убрать
      this.id = body.id;
      this.title = body.title;
      this.description = body.description;
      this.code = body.code;
      this.visibility = body.visibility;
      this.created_at = body.created_at;
      this.updated_at = body.updated_at;
      this.user_id = body.user_id;
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

.error-area-border-error {
  border: 2px solid red !important;
}

.error-area {
  width: 100%;
  background: #282C34;
  margin: 10px 0;
  border-radius: 8px;
  border: 2px solid transparent;
  padding: 10px;
  color: lightgray;
}

.error-log-title {
  margin-left: 10px;
}

.error-line {
  margin-top: 4px;
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
  padding: 10px;
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



</style>