<template>
  <loader v-if="isLoadingShaders"/>
  <div v-else class="shaders-wrapper">
    <dialog-window v-model:show="this.showShaderDeleteDialog">
      <loader :size="'100px'" :thickness="'3px'" :color="'lightgrey'" v-if="this.isDeletingShader"></loader>
      <div v-else>
        <h2 style="text-align: center">Delete this shader?</h2>
        <div class="dialog-window__buttons">
          <button class="dialog-btn action-btn" @click="this.showShaderDeleteDialog = false">Cancel</button>
          <button class="dialog-btn action-btn" @click="deleteShader">Delete</button>
        </div>
      </div>
    </dialog-window>
    <h1 v-if="this.shaders?.length === 0">User has no shaders</h1>
    <pagination
        v-model:page="currentPage"
        :pages="this.totalPages"
        class="pagination"/>
    <div class="shader-grid">
      <div
          class="shader-cell"
          v-for="(shader, index) in this.shaders"
          @mouseenter="handleMouseEnter(index)"
          @mouseleave="handleMouseLeave(index)"
          @click="$router.push(`/new/${shader['id']}`)"
      >
        <shader-window
            class="shader-window"
            ref="shaders"
            :key="shader.id"
            :code="shader.code"
            :initial-pause="true"
            :disable-mouse-down-event="true"
            :disable-mouse-up-event="true"
            :disable-mouse-move-event="true"
        />
        <div class="shader-cell__info">
          <div class="info-row">
            <span class="info-label">Title:</span> <span class="info-value">{{ shader.title }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Visibility:</span> <span
              class="info-value">{{ shader.visibility ? 'Public' : 'Private' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Views:</span> <span class="info-value">{{ shader.views }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Likes:</span> <span class="info-value">{{ shader.likes }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Comments:</span> <span class="info-value">{{ shader.comments }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Created at:</span> <span class="info-value">{{
              formatDate(shader.createdAt)
            }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Last update:</span> <span
              class="info-value">{{ formatDate(shader.updatedAt) }}</span>
          </div>
          <div class="info-row" :class="{'invisible' : !shader.origin?.id}">
            <span class="info-label">Forked from:</span>
            <span
                @click.stop="$router.push(`/new/${shader.origin?.id}`)"
                class="info-value" :class="{'link': shader.origin?.id}">
              {{ truncate(shader.origin?.title ? shader.origin?.title : "", 17) }}
            </span>
          </div>
          <div class="right-icons">
            <delete-icon
                v-if="isStoreUser"
                v-tooltip="'Delete shader'"
                class="icon-btn action-btn"
                @click.stop="handleDeleteShaderClick(shader.id)"/>
            <share-icon
                v-if="!this.isClipboardCopied || this.clipboardShaderId !== shader.id"
                v-tooltip="'Copy link'"
                class="icon-btn action-btn"
                @click.stop="shareShader(shader.id)"/>
            <check-icon v-else class="icon-btn"/>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import formatDate from "@/utils/formatDate.js";
import truncate from "@/utils/truncate.js";
import Error from "@/components/Error.vue";
import Loader from "@/components/Loader.vue";

export default {
  name: "ShaderTab",
  components: {Loader},

  data() {
    return {
      isLoadingShaders: false,
      shaders: [],
      currentPage: 1,
      totalPages: 0,
      SHADERS_PER_PAGE: 8,
      sortOption: "NEWEST",
      isClipboardCopied: false,
      clipboardShaderId: null,
      showShaderDeleteDialog: false,
      isDeletingShader: false,
      shaderForDelete: null,

      API_URL: import.meta.env.VITE_API_URL,
    }
  },
  props: {
    isStoreUser: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    truncate,
    formatDate,
    handleMouseEnter(index) {
      this.$refs.shaders[index].togglePause();
    },
    handleMouseLeave(index) {
      this.$refs.shaders[index].togglePause()
    },
    handleDeleteShaderClick(shaderId) {
      this.shaderForDelete = shaderId;
      this.showShaderDeleteDialog = true
    },
    shareShader(shaderId) {
      navigator.clipboard.writeText(`${window.location.origin}/new/${shaderId}`);
      this.isClipboardCopied = true;
      this.clipboardShaderId = shaderId;
      setTimeout(() => {
        this.isClipboardCopied = false;
        this.clipboardShaderId = null;
      }, 1000);
    },
    fetchShaders(username, page, pageSize, sortOption) {
      this.isLoadingShaders = true;
      fetch(`${this.API_URL}/shaders?username=${username}&page=${page - 1}&page_size=${pageSize}&sort_option=${sortOption}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        credentials: 'include'
      }).then(response => {
        if (!response.ok) {
          throw new Error(response.text() || "Server returned an error");
        }
        this.totalPages = parseInt(response.headers.get('X-Total-Pages'));
        return response.json();
      }).then(shaders => {
        this.shaders = shaders;

      }).catch(error => {
        this.$refs.errorToast.show("Error getting shaders"); // TODO проверить
      }).finally(() => {
        this.isLoadingShaders = false;
      })
    },
    async deleteShader() {
      this.isDeletingShader = true;
      try {
        const response = await fetch(`${this.API_URL}/shaders/${this.shaderForDelete}`, {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json'},
          credentials: 'include'
        });

        if (response.ok) {
          this.shaders = this.shaders.filter(shader => shader.id !== this.shaderForDelete);
          this.fetchShaders(this.$route.params.id, this.currentPage, this.SHADERS_PER_PAGE, this.sortOption); // чтобы сделать сделать
          // this.activities = this.activities.filter(activity => activity.shader_id !== this.shaderForDelete);
          this.shaderForDelete = null;
          this.$refs.generalToast.show("Successfully deleted shader");
        }
      } catch (error) {
        this.$refs.errorToast.show("Error deleting shader");
      } finally {
        this.isDeletingShader = false
        this.showShaderDeleteDialog = false;
      }
    },
  },
  watch: {
    sortOption(newOption) {
      this.fetchShaders(this.$route.params.id, this.currentPage, this.SHADERS_PER_PAGE, newOption);
    },
    currentPage(newPage) {
      this.fetchShaders(this.$route.params.id, newPage, this.SHADERS_PER_PAGE, this.sortOption);
    }
  },
  mounted() {
    this.fetchShaders(this.$route.params.id, this.currentPage, this.SHADERS_PER_PAGE, this.sortOption);
  }
}
</script>


<style scoped>
.pagination {
  margin: 0 0 16px auto;
}

.shaders-wrapper {
  display: flex;
  flex-direction: column;
}


.shader-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
}

.shader-cell {
  width: 100%;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.shader-cell:hover {
  transform: translateY(-10px) scale(1.02);
  cursor: pointer;
  box-shadow: 0 10px 10px rgba(40, 44, 52, 0.8);

}

.shader-cell:hover .shader-cell__info {
  background: rgba(40, 40, 60, 0.9);
}

.shader-window {
  cursor: pointer;
}

.shader-window :deep(canvas) {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.shader-cell__info {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px 16px;
  padding: 16px;
  background: rgba(40, 44, 52, 0.8);
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  color: lightgray;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.invisible {
  visibility: hidden;
}

.shader-cell__info .info-row {
  display: flex;
  align-items: center;
}

.shader-cell__info .info-label {
  flex-shrink: 0;
  margin-right: 6px;
  font-weight: 600;
  color: #a0a0ff;
}

.shader-cell__info .info-value {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shader-cell__info .right-icons {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.dialog-btn {
  background: transparent;
  border-radius: 8px;
  border: 1px solid #282C34;
  font-size: large;
  color: lightgray;
  display: flex;
  padding: 0.7rem;
  align-items: center;
  justify-content: center;
}

.dialog-window__buttons {
  display: flex;
  justify-content: space-between;
  margin: 10px 0 0;
}


.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover {
  color: white;
  border: 1px solid lightgray;
  cursor: pointer;
}
</style>