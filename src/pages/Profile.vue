<template>
  <loader v-if="this.isLoading"></loader>
  <div v-else-if="this.isError" class="error-page-block">
    <error :status="this.errorStatus"></error>
  </div>
  <div v-else>
    <toast ref="generalToast" :background="'#282C34'"></toast>
    <toast ref="errorToast"></toast>
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
    <dialog-window v-model:show="this.showAvatarDeleteDialog">
      <loader :size="'100px'" :thickness="'3px'" :color="'lightgrey'" v-if="this.isDeletingAvatar"></loader>
      <div v-else>
        <h2 style="text-align: center">Delete avatar?</h2>
        <div class="dialog-window__buttons">
          <button class="dialog-btn action-btn" @click="this.showAvatarDeleteDialog = false">Cancel</button>
          <button class="dialog-btn action-btn" @click="deleteAvatar">Delete</button>
        </div>
      </div>
    </dialog-window>
    <div class="user-wrapper">
      <div class="user-background">
        <img
            :src="`${this.PUBLIC_API_URL}/images/${this.user.backgroundUrl}`"
            alt=""
        >
        <input
            style="display: none;"
            v-if="this.isStoreUser"
            type="file"
            ref="backgroundInput"
            accept="image/*"
            @change="userImageLoadHandler($event, 'BACKGROUND')"
        >
        <div v-if="this.isStoreUser" class="cover-btns">
          <button class="cover-btn left-btn" @click="triggerBackgroundInput">Change cover</button>
          <button class="cover-btn right-btn" @click="handleClearBackground">Clear</button>
        </div>

      </div>
      <div class="user-info-wrapper">
        <div class="user-info__avatar" :class="{ 'editable': isStoreUser }">
          <img
              :src="`${this.PUBLIC_API_URL}/images/${this.user.avatarUrl || 'avatar.png'}`"
              alt="avatar"
              width="224"
              height="224"
              @click="triggerAvatarInput"
          />
          <input
              style="display: none;"
              v-if="this.isStoreUser"
              type="file"
              ref="avatarInput"
              accept="image/*"
              @change="userImageLoadHandler($event, 'AVATAR')"
          >
        </div>
        <div class="user-info">
          <span class="title">{{ this.user.name }}</span>
          <span class="biography">
            <edit-icon
                v-if="isStoreUser && !this.isEditing && !isPatchingBiography"
                v-tooltip="'Edit biography'"
                :color="'#282C34'"
                class="user-info__icon editable"
                @click="handleEditClick"/>
            <check-icon
                v-if="this.isEditing && !isPatchingBiography"
                v-tooltip="'Save biography'"
                :color="'#282C34'"
                class="user-info__icon editable"
                @click="handleOkClick"></check-icon>
            <spinner
                v-else v-if="isPatchingBiography"
                class="user-info__icon"/>
            <cancel-icon
                v-if="this.isEditing"
                v-tooltip="'Cancel changes'"
                :color="'#282C34'"
                class="user-info__icon"
                :class="{ 'editable': !isPatchingBiography }"
                @click="handleCancelClick"/>
            <span v-if="!this.isEditing">{{ this.user.biography }}</span>
            <input size="140" maxlength="140" v-else type="text" v-model="this.biographyEdit">
          </span>

          <span class="icon">
            <code-icon v-tooltip="'Number of user\'s shaders'" :color="'#282C34'" class="user-info__icon"></code-icon> {{
              this.user.shaders?.length || 0
            }}
            <fork-icon v-tooltip="'Number of forks on user\'s shaders'" :color="'#282C34'"
                       class="user-info__icon"></fork-icon> {{ this.user.total_forks }}
            <like-icon v-tooltip="'Number of likes on user\'s shaders'" :color="'#282C34'"
                       class="user-info__icon"></like-icon> {{ this.user.total_likes }}
            <comment-icon v-tooltip="'Number of comments on user\'s shaders'" :color="'#282C34'"
                          class="user-info__icon"></comment-icon> {{ this.user.total_comments }}
          </span>
        </div>
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

      <div v-if="activeTab === 'Shaders'" class="shaders-wrapper">
        <h1 v-if="this.user.shaders?.length === 0 || false">User has no shaders</h1>
        <pagination
            v-if="pagesCount > this.SHADERS_PER_PAGE"
            v-model:page="page"
            :pages="this.totalPages"
            class="pagination"/>
        <div class="shader-grid">
          <div
              class="shader-cell"
              v-for="(shader, index) in this.user.shaders"
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
                  class="info-value">{{ formatDate(shader.updated_at) }}</span>
              </div>
              <div class="info-row" :class="{'invisible' : shader.originId === null}">
                <span class="info-label">Forked:</span> <span
                  class="info-value">{{ truncate(shader.originShader ? shader.originShader.title : "", 17) }}</span>
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

      <div v-else-if="activeTab === 'Activity'">
        <table class="shader-table">
          <thead>
          <tr>
            <th :class="{'bottom-left-border-radius': this.user.activities.length === 0}">Activity</th>
            <th>Shader</th>
            <th :class="{'bottom-right-border-radius': this.user.activities.length === 0}">Date</th>
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
        <button v-if="this.totalActivities > this.activity_page * this.ACTIVITIES_PER_PAGE" class="activity-load-btn"
                @click="loadMoreActivities">
          <spinner v-if="isLoadingActivities"></spinner>
          <span v-else>Upload more</span>
        </button>
      </div>

      <div v-else-if="activeTab === 'Account'">
        <div class="change-password-wrapper">
          <h1>Change password</h1>
          <input
              type="password"
              placeholder="Old password"
              v-model.trim="oldPassword"
              @keydown="preventWhitespace"
              required/>
          <input
              type="password"
              placeholder="New password"
              v-model.trim="newPassword"
              @keydown="preventWhitespace"
              required/>
          <input
              type="password"
              placeholder="Confirm password"
              v-model.trim="confirmPassword"
              @keydown="preventWhitespace"
              required/>
          <button class="submit-btn" type="submit" @click="changePassword">
            <span v-if="!this.isPatchingPassword">Change password</span>
            <spinner v-else/>
          </button>
          <transition name="shake">
            <label v-if="this.passwordLog" :class="{'success' : this.successedPasswordChange}">{{
                this.passwordLog
              }}</label>
          </transition>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import Loader from "@/components/Loader.vue";
import HideIcon from "@/components/Icons/HideIcon.vue";
import UnhideIcon from "@/components/Icons/UnhideIcon.vue";
import DeleteIcon from "@/components/Icons/DeleteIcon.vue";
import ShareIcon from "@/components/Icons/ShareIcon.vue";
import LikeIcon from "@/components/Icons/LikeIcon.vue";
import CommentIcon from "@/components/Icons/CommentIcon.vue";
import DialogWindow from "@/components/DialogWindow.vue";
import ForkIcon from "@/components/Icons/ForkIcon.vue";
import SaveIcon from "@/components/Icons/SaveIcon.vue";
import CheckIcon from "@/components/Icons/CheckIcon.vue";
import CodeIcon from "@/components/Icons/CodeIcon.vue";
import ShaderWindow from "@/components/ShaderWindow.vue";
import Pagination from "@/components/Pagination.vue";
import truncate from "../utils/truncate.js";
import ForbiddenIcon from "@/components/Icons/ForbiddenIcon.vue";
import EditIcon from "@/components/Icons/EditIcon.vue";
import CancelIcon from "@/components/Icons/CancelIcon.vue";
import Spinner from "@/components/Spinner.vue";
import Toast from "@/components/Toast.vue";
import StatusCodeIcon from "@/components/Icons/StatusCodeIcon.vue";
import Error from "@/components/Error.vue";
import formatDate from "@/utils/formatDate.js";
import {formatDateTime} from "@/utils/formatDateTime.js";

export default {
  data() {
    return {
      isError: false,
      errorStatus: null,
      user: {
        id: null,
        name: "",
        createdAt: null,
        avatarUrl: null,
        backgroundUrl: null,
        biography: ""
      },
      isLoading: false,
      tabs: ['Shaders', 'Activity'], // Account добавляется в mounted
      activeTab: 'Shaders',
      showAvatarDeleteDialog: false,
      isDeletingAvatar: false,
      showShaderDeleteDialog: false,
      isDeletingShader: false,
      shaderForDelete: null,
      isClipboardCopied: false,
      clipboardShaderId: null,
      page: 1,
      totalPages: 0,
      SHADERS_PER_PAGE: 8,
      isNotFound: false,
      isEditing: false,
      biographyEdit: null,
      isPatchingBiography: false,
      activity_page: 1,
      ACTIVITIES_PER_PAGE: 20,
      totalActivities: 0,
      isLoadingActivities: false,

      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      passwordLog: "",
      successedPasswordChange: false,
      isPatchingPassword: false,

      API_URL: import.meta.env.VITE_API_URL,
      PUBLIC_API_URL: import.meta.env.VITE_PUBLIC_API_URL,
    }
  },
  methods: {
    formatDateTime,
    formatDate,
    truncate,
    preventWhitespace(event) {
      if (event.key.match(/\s/)) {
        event.preventDefault();
      }
    },
    async changePassword() {
      if (this.oldPassword === "" || this.newPassword === "" || this.confirmPassword === "") {
        this.passwordLog = "All fields are required";
        return;
      }

      this.passwordLog = "";
      if (this.newPassword !== this.confirmPassword) {
        this.passwordLog = "Passwords don't match";
        return;
      }

      const payload = {
        oldPassword: this.oldPassword,
        newPassword: this.newPassword
      };

      try {
        this.isPatchingPassword = true;

        const response = await fetch(this.API_URL + '/auth/password', {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          credentials: 'include',
          body: JSON.stringify(payload)
        });
        console.log(response.status);
        if (response.status === 401) {
          this.passwordLog = "Wrong old password";
          return;
        }
        this.successedPasswordChange = true;
        this.passwordLog = "Password changed successfully";
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      } catch (error) {
        this.passwordLog = "Error changing password";
      } finally {
        this.isPatchingPassword = false;
      }
    },
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
    deleteAvatar() {
      this.isDeletingAvatar = true;
      fetch(`${this.API_URL}/users/image?type=AVATAR`, {
        method: 'DELETE',
        credentials: 'include'
      }).then(response => {
        if (!response.ok) {
          throw new Error(response.text() || "Server returned an error");
        }
        this.user.avatarUrl = null;
        this.$refs.generalToast.show("Successfully cleared avatar");
      }).catch(error => {
        this.$refs.errorToast.show("Error clearing avatar");
      }).finally(() => {
        this.isDeletingAvatar = false;
        this.showAvatarDeleteDialog = false;
      })
    },
    async deleteShader() {
      this.isDeletingShader = true;
      try {
        // await new Promise(resolve => setTimeout(resolve, 1000));
        const response = await fetch(this.API_URL + '/shaders/' + this.shaderForDelete, {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json'},
          credentials: 'include'
        });

        if (response.ok) {
          this.user.shaders = this.user.shaders.filter(shader => shader.id !== this.shaderForDelete);
          this.user.activities = this.user.activities.filter(activity => activity.shader_id !== this.shaderForDelete);
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
    triggerAvatarInput() {
      if (this.user.avatarUrl !== null) {
        this.showAvatarDeleteDialog = true;
      } else {
        this.$refs.avatarInput.click();
      }
    },
    triggerBackgroundInput() {
      this.$refs.backgroundInput.click()
    },
    userImageLoadHandler(event, imageType) {
      const image = event.target.files[0];
      if (!image) {
        this.$refs.errorToast.show("Error uploading image");
      }

      const formData = new FormData();
      formData.append('image', image);

      fetch(`${this.API_URL}/users/image?type=${imageType}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      }).then(response => {
        if (!response.ok) {
          throw new Error(response.text() || "Server returned an error");
        }
        this.$refs.generalToast.show("Successfully uploaded image");
        return response.text();
      }).then(imageUrl => {
        switch (imageType) {
          case "AVATAR":
            this.user.avatarUrl = imageUrl;
            break;
          case "BACKGROUND":
            this.user.backgroundUrl = imageUrl;
            break;
        }
      }).catch(error => {
        this.$refs.errorToast.show("Error uploading image");
      })
    },
    handleClearBackground() {
      this.isDeletingAvatar = true;
      fetch(`${this.API_URL}/users/image?type=BACKGROUND`, {
        method: 'DELETE',
        credentials: 'include'
      }).then(response => {
        if (!response.ok) {
          throw new Error(response.text() || "Server returned an error");
        }
        this.user.backgroundUrl = null;
        this.$refs.generalToast.show("Successfully cleared background");
      }).catch(error => {
        this.$refs.errorToast.show("Error clearing background");
      }).finally(() => {
        this.isDeletingAvatar = false;
        this.showAvatarDeleteDialog = false;
      })
    },
    handleEditClick() {
      this.isEditing = true;
    },
    async handleOkClick() {
      if (this.biographyEdit === this.user.biography) {
        this.isEditing = false;
        return;
      }
      this.isPatchingBiography = true;
      try {
        const response = await fetch(this.API_URL + '/profile/biography', {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          credentials: 'include',
          body: JSON.stringify({biography: this.biographyEdit})
        });
        if (response.ok) {
          this.user.biography = this.biographyEdit;
          this.isEditing = false;
        }
      } catch (error) {
        this.$refs.errorToast.show("Error updating biography");
      } finally {
        this.isPatchingBiography = false;
      }
    },
    handleCancelClick() {
      if (this.isPatchingBiography) return;
      this.isEditing = false;
      this.biographyEdit = this.user.biography;
    },
    handleTabClick(tab) {
      this.activeTab = tab
      this.passwordLog = ""
    },
    async loadMoreActivities() {
      try {
        this.isLoadingActivities = true;
        const response = await fetch(`${this.API_URL}/profile/${this.$route.params.id}/activities?activity_page=${this.activity_page + 1}&limit=${this.ACTIVITIES_PER_PAGE}`, {
          method: "GET",
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
        });
        this.activity_page += 1;
        const data = await response.json();
        this.user.activities.push(...data);
      } catch (error) {
        console.log(error);
        this.$refs.errorToast.show("Error loading more activities");
      } finally {
        this.isLoadingActivities = false;
      }
    }
  }
  ,
  computed: {
    isStoreUser() {
      return this.user.id === this.$store.state.user.id && this.$store.state.isAuth;
    },
  },
  watch: {
    page(newPage) {
      console.log(`Page changed to ${newPage}`)
      this.page = newPage;
      this.$refs.shaders.forEach(shader => {
        shader.uploadShader()
      });
    }
  },
  mounted() {
    this.isLoading = true;
    fetch(`${this.API_URL}/users/${this.$route.params.id}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
      credentials: 'include',
    }).then(response => {
      if (!response.ok) {
        throw new Error(response.text() || "Server returned an error");
      }
      console.log(response);
      this.totalPages = parseInt(response.headers.get('X-Total-Pages'));
      return response.json();
    }).then(data => {
      Object.assign(this.user, data);
      this.biographyEdit = this.user.biography;
      // this.totalActivities = parseInt(response.headers.get('x-total-count')) || this.totalActivities
    }).catch(error => {
      this.isError = false;
      this.errorStatus = error.status;
    }).finally(() => {
      this.isLoading = false;
      if (this.isStoreUser) {
        this.tabs.push('Account');
      }
    })
    // TODO обработать 409, когда указан несуществующий пользователь
  }
}
</script>

<style scoped>

.user-wrapper {
  position: relative;
  width: 100%;
  font-family: 'Arial', sans-serif;
  color: #282C34;
}

/* Баннер: неизменный */
.user-background {
  width: 100%;
  height: 240px;
  overflow: hidden;
  background: linear-gradient(135deg, #0d1b2a, #1b263b, #415a77, #0d1b2a);
}

.user-background img {
  width: 100%;
  object-fit: contain;
}


.cover-btns {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  overflow: hidden;
  border-radius: 10px;
}


.cover-btn {
  position: relative;
  padding: 8px 12px;
  background: #282C34;
  color: lightgray;
  border: none;
  opacity: 0;
  transition: background-color 0.3s ease, opacity 0.3s ease;
}

.cover-btn:hover {
  cursor: pointer;
  background-color: #3a3f4b; /* чуть светлее при наведении */
}

.cover-btn.left-btn::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 50%;
  background-color: lightgray;
}

.user-background:hover .cover-btn {
  opacity: 1;
}

.user-info-wrapper {
  position: absolute;
  top: 240px; /* сразу под баннером */
  left: 32px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}


.user-info__avatar {
  position: relative;
  top: -64px; /* - половина 128px */
  z-index: 10;
  width: 128px;
  height: 128px;
  background-color: #000000;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid rgb(53, 59, 67);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  transition: all 0.3s ease;

}

.user-info__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info__avatar.editable:hover {
  cursor: pointer;
  transform: scale(1.05);
  box-shadow: 0 4px 24px rgba(255, 255, 255, 0.5);
}

.user-info {
  display: flex;
  flex-direction: column;
  color: #282C34;
}

.user-info .title {
  font-size: 1.8rem;
  font-weight: bold;
}

.user-info .biography {
  font-weight: normal;
}

.user-info .icon {
  font-size: 1rem;
}

.user-info .biography input {
  outline: none;
  border: 1px solid #282C34;
  border-radius: 0.3rem;
  padding: 2px;
  background-color: transparent;
  color: #282C34;
}

.user-info__icon {
  height: 24px;
  width: 24px;
  vertical-align: middle;
  padding: 2px;
}

.user-info__icon.editable:hover {
  cursor: pointer;
  border: 1px solid #282C34;
  border-radius: 4px;
}

/* Основной контейнер приложения */
.tabs-wrapper {
  margin-top: 80px;

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


.pagination {
  margin: 0 0 16px auto;
}


/* Таблица */
.shader-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  color: lightgray;
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


.bottom-left-border-radius {
  border-bottom-left-radius: 10px;
}

.bottom-right-border-radius {
  border-bottom-right-radius: 10px;
}

.shader-table th:first-child,
.shader-table td:first-child {
  width: 1%;
  white-space: nowrap;
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

.dialog-window__buttons {
  display: flex;
  justify-content: space-between;
  margin: 10px 0 0;
}


.icon-btn {
  width: 36px;
  height: 36px;
  padding: 4px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
}

.dialog-btn {
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
}

.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover {
  color: white;
  border: 1px solid lightgray;
  cursor: pointer;
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

/* Одна строка информации */
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

.invisible {
  visibility: hidden;
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


.change-password-wrapper {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.change-password-wrapper h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.change-password-wrapper input {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.change-password-wrapper input:focus {
  outline: none;
  border-color: #282C34;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.change-password-wrapper .submit-btn {
  padding: 0.75rem 1rem;
  background-color: #282C34;
  color: #fff;
  font-weight: 500;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
}

.change-password-wrapper .submit-btn:hover {
  background-color: #3a3f4b;
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.change-password-wrapper .submit-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.change-password-wrapper label {
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
}

.change-password-wrapper label.success {
  color: green;
}


.shake-enter-active {
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  20%, 60% {
    transform: translateX(-8px);
  }
  40%, 80% {
    transform: translateX(8px);
  }
}


.activity-load-btn {
  display: flex;
  justify-content: center;
  margin: 1rem auto 0;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #282C34;
  transition: all 0.3s ease;
  font-size: large;
}

.activity-load-btn:hover {
  background: #282C34;
  color: lightgray;
  cursor: pointer;
}
</style>