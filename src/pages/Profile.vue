<template>
  <loader v-if="this.isLoading"></loader>
  <!-- TODO сделать обработку удаленных пользователей -->
  <div v-else>
    <dialog-window v-model:show="this.showDialog">
      <loader :size="'100px'" :thickness="'3px'" :color="'lightgrey'" v-if="this.isDeletingShader"></loader>
      <div v-else>
        <h2 style="text-align: center">Are you sure?</h2>
        <div class="dialog-window__buttons">
          <button class="simple-btn action-btn" @click="this.showDialog = false">Cancel</button>
          <button class="simple-btn action-btn" @click="deleteShader">Delete</button>
        </div>
      </div>
    </dialog-window>
    <div class="user-wrapper">
      <div class="user-main-info">
        <div class="avatar-wrapper" :class="{ 'editable': isStoreUser }">
          <img
              :src="`${this.API_URL}/public/${this.user.avatar_url || 'avatars/avatar.png'}`"
              class="avatar-img"
              alt="avatar"
              width="224"
              height="224"
              @click="triggerAvatarInput"
          />

          <input
              v-if="this.isStoreUser"
              type="file"
              class="avatar-input"
              ref="avatarInput"
              accept="image/*"
              @change="avatarLoadHandler"
          >
        </div>
        <div class="user-main-info__name">{{ this.user.name }}</div>
        <hr>
        <div class="user-side-info">
          <div class="user-side-info__joined"><span class="user-side-info__title">Joined:</span>
            {{ this.formatDate(this.user.created_at) }}
          </div>
          <div class="user-side-info__email"><span class="user-side-info__title">Email:</span> {{ this.user.email }}
          </div>
          <!--          <div class="user-side-info__biography"><span class="user-side-info__title">Biography:</span>-->
          <!--            {{ this.user.biography }}-->
          <!--          </div>-->
        </div>
      </div>
      <div class="tabs-wrapper">
        <div class="tabs">
          <button
              v-for="tab in tabs"
              :key="tab"
              :class="{ 'active': tab === activeTab }"
              class="tab"
              @click="handleTabClick(tab)">
            {{ tab }}
          </button>
        </div>

        <table v-if="activeTab === 'Shaders'" class="shader-table">
          <thead>
          <tr>
            <th>Visibility</th>
            <th>Shader</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr class="shader-item" v-for="shader in user.shaders" :key="shader.id">
            <td class="shader-item__visibility">
              <unhide-icon class="icon-btn" v-if="shader.visibility"></unhide-icon>
              <hide-icon class="icon-btn" v-else></hide-icon>
            </td>
            <td>
              <router-link :to="`/new/${shader.id}`" class="shader-link">
                {{ shader.title }}
              </router-link>
            </td>
            <td>{{ formatDate(shader.created_at) }}</td>
            <td>
              <delete-icon v-if="isStoreUser" class="icon-btn action-btn" @click="handleDeleteShaderClick(shader.id)"></delete-icon>
              <share-icon class="icon-btn action-btn" v-if="!this.isClipboardCopied || this.clipboardShaderId !== shader.id" @click="shareShader(shader.id)" ></share-icon>
              <check-icon class="icon-btn" v-else></check-icon>
            </td>
          </tr>
          </tbody>
        </table>
        <table v-else-if="activeTab === 'Activity'" class="shader-table">
          <thead>
          <tr>
            <th>Activity</th>
            <th>Shader</th>
            <th>Date</th>
          </tr>
          </thead>
          <tbody>
          <tr class="shader-item" v-for="(activity,index) in user.activities" :key="index">
            <td class="shader-item__activity">
              <like-icon class="icon-btn" v-if="activity.type === 'like'"></like-icon>
              <comment-icon class="icon-btn" v-else-if="activity.type === 'comment'"></comment-icon>
              <fork-icon class="icon-btn" v-else-if="activity.type=== 'fork'"></fork-icon>
            </td>
            <td>
              <router-link :to="`/new/${activity.shader_id}`" class="shader-link">
                {{ activity.shader_title }}
              </router-link>
            </td>
            <td>{{ formatDateTime(activity.action_created_at) }}</td>
          </tr>
          </tbody>
        </table>

        <div v-else-if="activeTab === 'Account'">
          <!-- TODO добавить здесь биографию пользователя-->
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import Loader from "@/components/Loader.vue";
import HideIcon from "@/components/UI/Icons/HideIcon.vue";
import UnhideIcon from "@/components/UI/Icons/UnhideIcon.vue";
import DeleteIcon from "@/components/UI/Icons/DeleteIcon.vue";
import ShareIcon from "@/components/UI/Icons/ShareIcon.vue";
import LikeIcon from "@/components/UI/Icons/LikeIcon.vue";
import CommentIcon from "@/components/UI/Icons/CommentIcon.vue";
import DialogWindow from "@/components/UI/DialogWindow.vue";
import ForkIcon from "@/components/UI/Icons/ForkIcon.vue";
import SaveIcon from "@/components/UI/Icons/SaveIcon.vue";
import CheckIcon from "@/components/UI/Icons/CheckIcon.vue";

export default {
  components: {
    CheckIcon,
    SaveIcon,
    ForkIcon, DialogWindow, CommentIcon, LikeIcon, ShareIcon, DeleteIcon, UnhideIcon, HideIcon, Loader},
  data() {
    return {
      user: {},
      isLoading: false,
      tabs: ['Shaders', 'Activity', 'Account'],
      activeTab: 'Shaders',
      showDialog: false,
      isDeletingShader: false,
      shaderForDelete: null,
      isClipboardCopied: false,
      clipboardShaderId: null,
      API_URL: import.meta.env.VITE_API_URL
    }
  },
  methods: {
    handleDeleteShaderClick(shaderId) {
      this.shaderForDelete = shaderId;
      this.showDialog = true
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
    async deleteShader() {
      this.isDeletingShader = true;
      try {
        // await new Promise(resolve => setTimeout(resolve, 1000));
        const response = await fetch(this.API_URL + '/shaders/' + this.shaderForDelete, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (response.ok) {
          this.user.shaders = this.user.shaders.filter(shader => shader.id !== this.shaderForDelete);
          this.user.activities = this.user.activities.filter(activity => activity.shader_id !== this.shaderForDelete);
          this.shaderForDelete = null;
          // TODO сделать окно с подтверждением удаления
        }
      } catch (error) {
        console.error('Ошибка при удалении шейдера:', error);
        // TODO тут можно добавить всплывающее сообщение или визуальное уведомление
      } finally {
        this.isDeletingShader = false
        this.showDialog = false;
      }
    },
    triggerAvatarInput() {
      this.$refs.avatarInput.click()
    },
    async avatarLoadHandler(event) {
      const file = event.target.files[0];
      if (!file) {
        // TODO открыть модальное окно с ошибкой
      }

      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const response = await fetch(this.API_URL + '/profile/avatar', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        const data = await response.json();
        this.user.avatar_url = data.avatar_url;

      } catch (error) {
        console.error('Ошибка при загрузке:', error);
        // TODO тут можно добавить всплывающее сообщение или визуальное уведомление
      }
    },
    handleTabClick(tab) {
      this.activeTab = tab
    },
    formatDate(date) {
      const _date = new Date(date);

      const day = String(_date.getDate()).padStart(2, '0');
      const month = String(_date.getMonth() + 1).padStart(2, '0');
      const year = _date.getFullYear();

      return `${day}-${month}-${year}`;
    },
    formatDateTime(date) {
      const _date = new Date(date);

      const day = String(_date.getDate()).padStart(2, '0');
      const month = String(_date.getMonth() + 1).padStart(2, '0');
      const year = _date.getFullYear();

      const hours = String(_date.getHours()).padStart(2, '0');
      const minutes = String(_date.getMinutes()).padStart(2, '0');
      const seconds = String(_date.getSeconds()).padStart(2, '0');

      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    },
  },
  computed: {
    isStoreUser() {
      return this.user.id === this.$store.state.user.id;
    }
  },
  async mounted() {
    this.isLoading = true;
    try {
      const response = await fetch(`${this.API_URL}/profile/${this.$route.params.id}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
      });
      // TODO обработать 409, когда указан несуществующий пользователь
      this.user = await response.json();
      console.log(this.user);
      // TODO доделать
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }
}
</script>

<style scoped>
.avatar-wrapper {
  position: relative;
  width: 128px;
  height: 128px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 16px;
  transition: transform 0.2s;
}

.avatar-wrapper.editable {
  cursor: pointer;
}

.avatar-wrapper.editable:hover {
  transform: scale(1.05);
}

.avatar-img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.avatar-input {
  display: none;
}

.user-main-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #282C34;
  width: fit-content;
  white-space: nowrap;
  height: fit-content;
  padding: 20px;
  margin: 10px;
  border-radius: 10px;
}

hr {
  width: 100%;
}

.user-header {
  display: flex;
  flex-direction: row;
}

.user-main-info__name {
  color: lightgray;
  font-size: x-large;
  align-self: center;
}

.user-side-info {
  background: #282C34;
  width: 100%;
  border-radius: 10px;
  color: lightgray;
  margin-top: 10px;
}

.user-side-info__title {
  font-weight: bold;
}


.user-side-info__email {
  margin-top: 10px;
}

.user-wrapper {
  display: flex;
}


/* Основной контейнер приложения */
.tabs-wrapper {
  width: 100%;
  padding: 16px;
  font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #282C34;
}

/* Секция вкладок */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  position: relative;
}
.tabs::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #e0e0e0;
  z-index: 0;
}
/* Кнопки вкладок */
.tab {
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
  position: relative;
  z-index: 1; /* вкладка поверх линии */

}

.tab.active {
  border-color: #282C34;
  color: #282C34;
  font-weight: 600;
}


/* Таблица */
.shader-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  color: lightgray;
  border-radius: 10px;
  overflow: hidden;
}

.shader-table thead tr:first-child th:first-child {
  border-top-left-radius: 10px;
}

.shader-table thead tr:first-child th:last-child {
  border-top-right-radius: 10px;
}

.shader-table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 10px;
}

.shader-table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 10px;
}


.shader-table th:first-child,
.shader-table td:first-child {
  width: 1%; /* «трюк» — 1% от контейнера превращается в auto-подгонку */
  white-space: nowrap; /* чтобы не переносилось и не растягивалось */
}

.shader-item__visibility {
  text-align: center !important;
}


.icon-btn {
  width: 36px;
  height: 36px;
  padding: 4px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
}


/* Заголовки таблицы */
.shader-table th,
.shader-table td {
  padding: 12px 16px;
  border: 1px solid #444;
  text-align: left;
}

.shader-table th {
  color: #282C34;
}

/* Строка с шейдером */
.shader-item {
  background: #282C34;
  transition: background 0.2s ease, transform 0.1s ease;

}

.shader-item:hover {
  background: #1e1e1e;
}

/* Ссылка на шейдер */
.shader-link {
  color: lightgray;
  text-decoration: none;
}

.shader-link:hover {
  text-decoration: underline;
}

.shader-table td {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shader-item__activity {
  text-align: center !important;
}

.dialog-window__buttons{
  display: flex;
  justify-content: space-between;
  margin: 10px 0 0;
}

.simple-btn {
  background: transparent;
  border-radius: 8px;
  border: 1px solid #282C34;
  font-size: large;
  color: lightgray;
  display: flex;
  margin: 0 5px;
  padding: 10px;
  align-items: center;
  justify-content: center;
  transition: border 0.2s ease, color 0.2s ease;
}

.action-btn:hover {
  color: white;
  border: 1px solid lightgray;
  cursor: pointer;
}


</style>