<template>
  <div class="outer-container">

    <div class="auth-container">
      <div class="tabs">
        <button class="left-tab" :class="{ active: isLoginForm }" @click="handleLoginTabClick">Login</button>
        <button class="right-tab" :class="{ active: !isLoginForm }" @click="handleRegisterTabClick">Registration
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div v-if="!isLoginForm" class="input-group">
          <input maxlength="20" type="text" placeholder="Name" v-model="form.name" required/>
        </div>

        <div class="input-group">
          <input maxlength="254" type="email" placeholder="Email" v-model="form.email" required/>
        </div>

        <div class="input-group">
          <input maxlength="254" type="password" placeholder="Password" v-model.trim="form.password" required/>
        </div>

        <div v-if="!isLoginForm" class="input-group">
          <input maxlength="254" type="password" placeholder="Confirm password" v-model.trim="form.confirmPassword"
                 required/>
        </div>

        <button class="submit-btn" :disabled="isLoading">
          <span v-if="!isLoading">{{ isLoginForm ? 'Sign in' : 'Sign up' }}</span>
          <spinner v-else></spinner>
        </button>
        <transition name="shake">
          <label v-if="errorMessage">{{ errorMessage }}</label>
        </transition>
      </form>
    </div>
  </div>
</template>

<script>
import {checkAuth} from "@/auth/checkAuth.js";
import Spinner from "@/components/UI/Spinner.vue";

export default {
  components: {Spinner},
  data() {
    return {
      isLoginForm: true, // Переключение между логином и регистрацией
      form: {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      isLoading: false,
      errorMessage: "",
      API_URL: import.meta.env.VITE_API_URL
    };
  },
  methods: {
    handleLoginTabClick() {
      this.isLoginForm = true;
      this.errorMessage = null;
    },
    handleRegisterTabClick() {
      this.isLoginForm = false;
      this.errorMessage = null;
    },
    async handleSubmit() {
      // TODO переделать, чтобы сервер работал с формой
      this.errorMessage = "";
      this.isLoading = true;
      await new Promise(resolve => setTimeout(() => resolve(), 1000));

      // Registration
      if (!this.isLoginForm) {
        if (this.form.password !== this.form.confirmPassword) {
          this.errorMessage = "Passwords are different";
          return;
        }

        const payload = {
          name: this.form.name,
          email: this.form.email,
          password: this.form.password,
        };
        try {
          const response = await fetch(this.API_URL + "/auth/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload),
            credentials: "include", // Для работы с куками
          });

          const data = await response.json();

          switch (response.status) {
            case 401:
              this.errorMessage = "Wrong email or password";
              break;
            case 409:
              this.errorMessage = "User already exists";
              break;
            case 422:
              this.errorMessage = "Validation error. Please check the form.";
              break;
            case 500:
              this.errorMessage = "Server error";
              break;
            case 200:
              this.$router.push("/");
              await checkAuth(this.$store);
              break;
          }
        } catch (error) {
          this.errorMessage = error.message;
        } finally {
          this.isLoading = false;
        }

      } else { // Login
        try {
          const payload = {
            email: this.form.email,
            password: this.form.password,
          };
          console.log(payload)
          const response = await fetch(this.API_URL + "/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload),
            credentials: "include", // Для работы с куками
          });
          const data = await response.json();
          switch (response.status) {
            case 401:
              this.errorMessage = "Wrong email or password";
              break;
            case 409:
              this.errorMessage = "User already exists";
              break;
            case 422:
              this.errorMessage = "Validation error. Please check the form.";
              break;
            case 500:
              this.errorMessage = "Server error";
              break;
            case 200:
              this.$router.push("/");
              await checkAuth(this.$store);
              break;
          }
        } catch (error) {
          this.errorMessage = error.message;
        } finally {
          this.isLoading = false;
        }
      }
    },
  },
};
</script>

<style scoped>

.auth-container {
  max-width: 400px;
  margin: 6rem auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: sans-serif;
}

.tabs {
  display: flex;
  justify-content: center;
}

.tabs button {
  flex: 1;
  padding: 0.75rem;
  background: none;
  border: 1px solid #ddd;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.left-tab {
  border-bottom-left-radius: 0.5rem;
  border-top-left-radius: 0.5rem;
}

.right-tab {
  border-bottom-right-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

.tabs button:hover {
  background-color: #f5f5f5;
}

.tabs button.active {
  background-color: #282C34;
  color: #fff;
  border-color: #282C34;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-group input {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #282C34;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* Кнопка отправки */
.submit-btn {
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



.submit-btn:hover {
  background-color: #3a3f4b;
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.submit-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

/* Ошибка запроса */
.auth-container label {
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
  min-height: 1em;
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



.spinner {
  width: 1rem; height: 1rem;
}



</style>
