<template>
  <div class="main">
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
            <upload-icon :fill="compileFailed? 'red' : 'lightgrey'"></upload-icon>
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
            <img width="24" height="24" src="/public/icons/expand.svg" alt="Expand" title="Expand">
          </button>
        </div>
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

export default {
  components: {PauseIcon, PlayIcon, RestartIcon, UploadIcon, FooterInfo, ShaderEditor, ShaderWindow, NavBar},
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
    }
  }
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
  padding: 4px;
  font-size: large;
  color: lightgray;
  cursor: pointer;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

}

.action-btn:hover {
  color: white;
  border: 1px solid lightgray;
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
  margin-top: 10px;
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
  margin-top: 10px;
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

</style>