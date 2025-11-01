<template>
  <toast ref="errorToast"/>
  <div class="nav-bar">
    <button class="nav-bar__main-btn" @click="this.$router.push('/')">FragmentVerse</button>
    <div class="nav-bar__items">
      <div
          v-show="this.$store.state.isAuth"
          class="nav-bar__label"
          @click="this.$router.push(`/profile/${this.$store.state.user.name}`)"
      >
        {{ this.$store.state.user.name }}
      </div>
      <button class="nav-bar__other-btn" @click="this.$router.push('/browse')">Browse</button>
      <button class="nav-bar__other-btn" @click="this.$router.push('/new')">New</button>
      <button class="nav-bar__other-btn" @click="authHandler()">{{ this.authText }}</button>
    </div>
  </div>
</template>

<script>
import {checkAuth} from "@/auth/checkAuth.js";
import Error from "@/components/Error.vue";
import toast from "@/components/Toast.vue";

export default {
  components: {toast, Error},
  data() {
    return {
      API_URL: import.meta.env.VITE_API_URL

    }
  },
  computed: {
    authText() {
      return this.$store.state.isAuth ? 'Log out' : 'Log in';
    }
  },
  methods: {
    authHandler() {
      if (this.$store.state.isAuth) {
        fetch(this.API_URL + '/auth/logout', {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              credentials: 'include'
            }
        ).then(response => {
          if (response.ok) {
            this.$store.commit('logout');
            this.$router.push('/');
          }else{
            this.$refs.errorToast.show("Error while logging out")
          }
        }).catch(err => {
          this.$refs.errorToast.show("Error while logging out")
        })
      } else {
        this.$router.push('/login')
      }
    }
  },
  mounted() {
    checkAuth(this.$store)
  }
}
</script>

<style scoped>
.nav-bar {
  display: flex;
  background: rgb(40, 44, 52);
  min-height: 50px;
}

.nav-bar__items {
  margin-left: auto;
  display: flex;
}

.nav-bar__main-btn {
  background: transparent;
  font-size: xx-large;
  border: none;
  padding: 5px;
  color: lightgray;
}

.nav-bar__main-btn:hover {
  cursor: pointer;
  color: white;
}

.nav-bar__other-btn {
  padding: 10px;
  margin: 10px;
  border-radius: 8px;
  background: transparent;
  font-size: large;
  cursor: pointer;
  color: lightgray;
  transition: border 0.2s ease, color 0.2s ease;
  border: 1px solid transparent;
}

.nav-bar__other-btn:hover {
  color: white;
  border: 1px solid lightgray;

}

.nav-bar__label {
  padding: 10px;
  margin: 10px;
  color: lightgray;
  cursor: pointer;
  font-size: large;
  transition: border 0.2s ease, color 0.2s ease;
  border: 1px solid transparent;
  border-radius: 8px;
}

.nav-bar__label:hover {
  cursor: pointer;
  color: white;
  border: 1px solid lightgray;
}

</style>