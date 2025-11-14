<template>
  <loader v-if="isLoadingShaders"/>
  <div v-else class="shaders-wrapper">
    <dialog-window v-model:show="showShaderDeleteDialog">
      <loader :size="'100px'" :thickness="'3px'" :color="'lightgrey'" v-if="isDeletingShader"/>
      <div v-else>
        <h2 style="text-align: center">Delete this shader?</h2>
        <div class="dialog-window__buttons">
          <button class="dialog-btn action-btn" @click="showShaderDeleteDialog = false">Cancel</button>
          <button class="dialog-btn action-btn" @click="deleteShader">Delete</button>
        </div>
      </div>
    </dialog-window>

    <h1 v-if="shaders?.length === 0">User has no shaders</h1>

    <pagination
        v-model:page="currentPage"
        :pages="totalPages"
        class="pagination"/>

    <div class="shader-grid">
      <div
          class="shader-cell"
          v-for="(shader, index) in shaders"
          :key="shader.id"
          @mouseenter="togglePause(index)"
          @mouseleave="togglePause(index)"
          @click="$router.push(`/new/${shader.id}`)"
      >
        <shader-window
            class="shader-window"
            ref="shaderRefs"
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
            <span class="info-label">Last update:</span> <span class="info-value">{{
              formatDate(shader.updatedAt)
            }}</span>
          </div>
          <div class="info-row" :class="{'invisible' : !shader.origin?.id}">
            <span class="info-label">Forked from:</span>
            <span
                @click.stop="$router.push(`/new/${shader.origin?.id}`)"
                class="info-value" :class="{'link': shader.origin?.id}">
              {{ truncate(shader.origin?.title ? shader.origin.title : "", 17) }}
            </span>
          </div>
          <div class="right-icons">
            <delete-icon
                v-if="isStoreUser"
                class="icon-btn action-btn"
                @click.stop="handleDeleteShaderClick(shader.id)"/>
            <share-icon
                v-if="!isClipboardCopied || clipboardShaderId !== shader.id"
                class="icon-btn action-btn"
                @click.stop="shareShader(shader.id)"/>
            <check-icon v-else class="icon-btn"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import Loader from "@/components/Loader.vue";
import pagination from "@/components/Pagination.vue";
import shaderWindow from "@/components/ShaderWindow.vue";
import formatDate from "@/utils/formatDate.js";
import truncate from "@/utils/truncate.js";
import {useProfileUsers} from "@/composables/useProfileUsers.js";
import {useProfileShaders} from "@/composables/useProfileShaders.js";
import DeleteIcon from "@/components/Icons/DeleteIcon.vue";
import ShareIcon from "@/components/Icons/ShareIcon.vue";
import CheckIcon from "@/components/Icons/CheckIcon.vue";
import {useToast} from "@/composables/useToast.js";


// --------------------
// Toast пример
// --------------------
const {show} = useToast();
const {isStoreUser} = useProfileUsers();

const {
  shaders,
  isLoadingShaders,
  totalPages,
  currentPage,
  showShaderDeleteDialog,
  isDeletingShader,
  shaderIdForDelete,
  fetchShaders,
  deleteShader,
  shareShader,
  isClipboardCopied,
  clipboardShaderId
} = useProfileShaders(show);

const shaderRefs = ref([]);

function togglePause(index) {
  shaderRefs.value[index]?.togglePause();
}

function handleDeleteShaderClick(shaderId) {
  shaderIdForDelete.value = shaderId;
  showShaderDeleteDialog.value = true;
}

onMounted(() => fetchShaders());
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
