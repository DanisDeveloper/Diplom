<template>
  <loader v-if="this.isLoading"></loader>
  <!-- TODO сделать обработку удаленных пользователей -->
  <div v-else>
    <h1>Профиль пользователя</h1>
    <div class="avatar-wrapper" :class="{'cursor-pointer': this.isStoreUser}">
      <img
          :src="`${this.API_URL}/public/${this.user.avatar_url || 'avatars/avatar.png'}`"
          alt="avatar"
          width="224"
          height="224"
          @click="triggerAvatarInput"
      />

      <input
          v-if="this.isStoreUser"
          type="file"
          ref="avatarInput"
          accept="image/*"
          style="display: none"
          @change="avatarLoadHandler"
      >
    </div>
    <ul>
      <li>ID: {{ this.user.id }}</li>
      <li>Username: {{ this.user.name }}</li>
      <li>Email: {{ this.user.email }}</li>
      <li>Biography: {{ this.user.biography }}</li>
      <li>Avatar: {{ this.user.avatar_url }}</li>
      <li>Created at: {{ this.user.created_at }}</li>
    </ul>
    <h1>Список шейдеров</h1>
    <ol>
      <li v-for="shader in user.shaders" :key="shader.id">
        <router-link :to="`/new/${shader.id}`">{{ shader.id }} - {{ shader.title }} - {{ shader.visibility }}
        </router-link>
      </li>
    </ol>
  </div>
</template>

<script>
import Loader from "@/components/Loader.vue";

export default {
  components: {Loader},
  data() {
    return {
      user: {},
      isLoading: false,
      API_URL: import.meta.env.VITE_API_URL
    }
  },
  methods: {
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

        if (!response.ok) {
          throw new Error('Ошибка загрузки аватара');
        }

        const data = await response.json();
        this.user.avatar_url = data.avatar_url;

      } catch (error) {
        console.error('Ошибка при загрузке:', error);
        // TODO тут можно добавить всплывающее сообщение или визуальное уведомление
      }
    }
  },
  computed: {
    isStoreUser() {
      return this.user.id === this.$store.state.user.id
    }
  },
  async mounted() {
    this.isLoading = true
    try {
      const response = await fetch(`${this.API_URL}/profile/${this.$route.params.id}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
      });
      // TODO обработать 409, когда указан несуществующий пользователь
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.user = await response.json();
      console.log(this.user);
      // TODO доделать
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false
    }
  }
}
</script>

<style scoped>
.avatar-wrapper {
  display: flex;
  width: fit-content;
}

.cursor-pointer {
  cursor: pointer;
}
</style>