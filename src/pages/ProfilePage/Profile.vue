<template>
  <dialog-window v-model:show="showAvatarDeleteDialog">
    <loader :size="'100px'" :thickness="'3px'" :color="'lightgrey'" v-if="isDeletingAvatar"></loader>
    <div v-else>
      <h2 style="text-align: center">Delete avatar?</h2>
      <div class="dialog-window__buttons">
        <button class="dialog-btn action-btn" @click="showAvatarDeleteDialog = false">Cancel</button>
        <button class="dialog-btn action-btn" @click="deleteAvatar">Delete</button>
      </div>
    </div>
  </dialog-window>
  <div class="user-wrapper">
    <div class="user-background">
      <img
          :src="`${this.$store.state.api.PUBLIC_API_URL}/images/${user.backgroundUrl}`"
          alt=""
      >
      <input
          ref="backgroundInput"
          style="display:none;"
          v-if="isStoreUser"
          type="file"
          accept="image/*"
          @change="userImageLoadHandler($event, 'BACKGROUND')"
      />
      <div v-if="isStoreUser" class="cover-btns">
        <button class="cover-btn left-btn" @click="triggerBackgroundInput">Change cover</button>
        <button class="cover-btn right-btn" @click="handleClearBackground">Clear</button>
      </div>

    </div>
    <div class="user-info-wrapper">
      <div class="user-info__avatar" :class="{ 'editable': isStoreUser }">
        <img
            :src="`${this.$store.state.api.PUBLIC_API_URL}/images/${user.avatarUrl || 'avatar.png'}`"
            alt="avatar"
            width="224"
            height="224"
            @click="triggerAvatarInput"
        />
        <input
            ref="avatarInput"
            style="display:none;"
            v-if="isStoreUser"
            type="file"
            accept="image/*"
            @change="userImageLoadHandler($event, 'AVATAR')"
        />
      </div>
      <div class="user-info">
        <span class="title">{{ user.name }}</span>
        <span class="biography">
            <edit-icon
                v-if="isStoreUser && !isEditing && !isPatchingBiography"
                v-tooltip="'Edit biography'"
                :color="'#282C34'"
                class="user-info__icon editable"
                @click="handleEditClick"/>
            <check-icon
                v-if="isEditing && !isPatchingBiography"
                v-tooltip="'Save biography'"
                :color="'#282C34'"
                class="user-info__icon editable"
                @click="handleOkClick"></check-icon>
            <spinner
                v-else v-if="isPatchingBiography"
                class="user-info__icon"/>
            <cancel-icon
                v-if="isEditing"
                v-tooltip="'Cancel changes'"
                :color="'#282C34'"
                class="user-info__icon"
                :class="{ 'editable': !isPatchingBiography }"
                @click="handleCancelClick"/>
            <span v-if="!isEditing">{{ user.biography }}</span>
            <input size="140" maxlength="140" v-else type="text" v-model="biographyEdit">
          </span>

        <span class="icon">
            <code-icon v-tooltip="'Number of user\'s shaders'" :color="'#282C34'" class="user-info__icon"></code-icon> {{
            totalShaders || 0
          }}
            <fork-icon v-tooltip="'Number of forks on user\'s shaders'" :color="'#282C34'"
                       class="user-info__icon"></fork-icon> {{ user.total_forks }}
            <like-icon v-tooltip="'Number of likes on user\'s shaders'" :color="'#282C34'"
                       class="user-info__icon"></like-icon> {{ user.total_likes }}
            <comment-icon v-tooltip="'Number of comments on user\'s shaders'" :color="'#282C34'"
                          class="user-info__icon"></comment-icon> {{ user.total_comments }}
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

    <shader-tab v-if="this.activeTab==='Shaders'" :is-store-user="isStoreUser"/>

    <div v-else-if="activeTab === 'Activity'">
      <table class="shader-table">
        <thead>
        <tr>
          <th :class="{'bottom-left-border-radius': user.activities.length === 0}">Activity</th>
          <th>Shader</th>
          <th :class="{'bottom-right-border-radius': user.activities.length === 0}">Date</th>
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
    <account-tab v-else-if="activeTab === 'Account'"/>

  </div>
</template>

<script>
import {formatDateTime} from "@/utils/formatDateTime.js";
import ShaderTab from "@/pages/ProfilePage/tabs/ShaderTab.vue";
import AccountTab from "@/pages/ProfilePage/tabs/AccountTab/AccountTab.vue";
import {useUsers} from "@/pages/ProfilePage/composables/useUsers.js";
import {onMounted} from "vue";
import {useRoute} from "vue-router";
import {useBiographyEdit} from "@/pages/ProfilePage/composables/useBiography.js";
import {useProfileImages} from "@/pages/ProfilePage/composables/useImages.js";
import {useShaders} from "@/pages/ProfilePage/composables/useShaders.js";

export default {
  components: {AccountTab, ShaderTab},
  data() {
    return {
      tabs: ['Shaders', 'Activity'], // Account добавляется в mounted
      activeTab: 'Shaders',
      isNotFound: false,
      activity_page: 1,
      ACTIVITIES_PER_PAGE: 20,
      totalActivities: 0,
      isLoadingActivities: false,
    }
  },
  methods: {
    formatDateTime,
    handleTabClick(tab) {
      this.activeTab = tab
      this.passwordLog = ""
    },
    async loadMoreActivities() {
      try {
        this.isLoadingActivities = true;
        const response = await fetch(`${this.$store.state.api.API_URL}/profile/${this.$route.params.id}/activities?activity_page=${this.activity_page + 1}&limit=${this.ACTIVITIES_PER_PAGE}`, {
          method: "GET",
          headers: {"Content-Type": "application/json"},
          credentials: 'include',
        });
        this.activity_page += 1;
        const data = await response.json();
        user.activities.push(...data);
      } catch (error) {
        console.log(error);
        this.notify("Error loading more activities", true);
      } finally {
        this.isLoadingActivities = false;
      }
    }
  },
  setup() {
    const route = useRoute();
    const {
      user,
      isStoreUser,
      fetchUser,
      isLoadingUser,
    } = useUsers();
    const {totalShaders} = useShaders();

    const {
      isEditing,
      biographyEdit,
      isPatchingBiography,
      handleEditClick,
      handleCancelClick,
      handleOkClick
    } = useBiographyEdit(user);

    const {
      avatarInput,
      backgroundInput,
      showAvatarDeleteDialog,
      isDeletingAvatar,
      triggerAvatarInput,
      triggerBackgroundInput,
      userImageLoadHandler,
      deleteAvatar,
      handleClearBackground
    } = useProfileImages(user);

    onMounted(() => {
      fetchUser(route.params.id);
    });

    return {
      user,
      isStoreUser,
      fetchUser,
      isLoadingUser,
      isEditing,
      biographyEdit,
      isPatchingBiography,
      handleEditClick,
      handleCancelClick,
      handleOkClick,
      avatarInput,
      backgroundInput,
      showAvatarDeleteDialog,
      isDeletingAvatar,
      triggerAvatarInput,
      triggerBackgroundInput,
      userImageLoadHandler,
      deleteAvatar,
      handleClearBackground,
      totalShaders
    }
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
  background-size: 300% 300%;
  animation: gradientMove 10s ease-in-out infinite;
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
  background-color: #3a3f4b;
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