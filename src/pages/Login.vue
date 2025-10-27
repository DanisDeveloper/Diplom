<template>
  <div class="outer-container">
    <div class="auth-container">
      <!-- Tabs with sliding underline -->
      <div class="tabs">
        <button class="tab left-tab" :class="{ active: isLoginForm }" @click="handleLoginTabClick">Login</button>
        <button class="tab right-tab" :class="{ active: !isLoginForm }" @click="handleRegisterTabClick">Registration
        </button>
        <div class="slider" :class="{ right: !isLoginForm }"></div>
      </div>

      <!-- Animated form container -->
      <transition name="form-height" mode="out-in">
        <form
            :key="isLoginForm ? 'login' : 'reg'"
            @submit.prevent="handleSubmit"
            class="form"
        >
          <!-- Fields appear with fade -->
          <transition-group name="field-fade" tag="div">
            <div class="input-group" key="name">
              <input
                  maxlength="20"
                  type="text"
                  placeholder="Name"
                  v-model="form.name"
                  @keydown="preventWhitespace"
                  required/>
            </div>

            <div v-if="!isLoginForm" class="input-group" key="email">
              <input
                  maxlength="254"
                  type="email"
                  placeholder="Email"
                  v-model="form.email"
                  @keydown="preventWhitespace"
                  required/>
            </div>

            <div class="input-group" key="password">
              <input
                  maxlength="254"
                  type="password"
                  placeholder="Password"
                  v-model.trim="form.password"
                  @keydown="preventWhitespace"
                  required/>
            </div>

            <div
                v-if="!isLoginForm"
                class="input-group"
                key="confirm"
            >
              <input
                  maxlength="254"
                  type="password"
                  placeholder="Confirm password"
                  v-model.trim="form.confirmPassword"
                  @keydown="preventWhitespace"
                  required
              />
            </div>
          </transition-group>

          <button class="submit-btn" :disabled="isLoading">
            <span v-if="!isLoading">{{ isLoginForm ? 'Sign in' : 'Sign up' }}</span>
            <spinner class="loading-spinner" v-else/>
          </button>

          <transition name="shake">
            <label v-if="errorMessage" :key="errorMessageKey" class="error-label">{{ errorMessage }}</label>
          </transition>
        </form>
      </transition>
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
      errorMessageKey: 0, // костыль чтобы обновлять сообщение с ошибкой
      API_URL: import.meta.env.VITE_API_URL
    };
  },
  methods: {
    preventWhitespace(event) {
      if (event.key.match(/\s/)) {
        event.preventDefault();
      }
    },
    handleLoginTabClick() {
      this.isLoginForm = true;
      this.errorMessage = "";
    },
    handleRegisterTabClick() {
      this.isLoginForm = false;
      this.errorMessage = "";
    },
    async handleSubmit() {
      // TODO переделать, чтобы сервер работал с формой
      this.errorMessage = "";
      this.errorMessageKey++;

      // Registration
      if (!this.isLoginForm) {
        if (this.form.password !== this.form.confirmPassword) {
          this.errorMessage = "Passwords are different";
          return;
        }

        try {
          const payload = {
            name: this.form.name,
            email: this.form.email,
            password: this.form.password,
          };

          this.isLoading = true;
          const response = await fetch(this.API_URL + "/auth/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload),
            credentials: "include", // Для работы с куками
          });
          console.log(response)
          if (response.ok) {
            this.$router.push("/");
            await checkAuth(this.$store);
          } else {
            const body = await response.json();
            //TODO переделать под коды ошибок
            switch (response.status) {
              case 401:
                this.errorMessage = "Wrong email or password";
                return;
              case 409:
                if (body.error === "USER_NAME_ALREADY_EXISTS")
                  this.errorMessage = "Username already exist";
                else if (body.error === "USER_EMAIL_ALREADY_EXISTS")
                  this.errorMessage = "Email already exist";
                return;
              case 422:
                this.errorMessage = "Validation error. Please check the form.";
                return;
              case 500:
                this.errorMessage = "Server error";
                return;
            }
          }
        } catch (error) {
          this.errorMessage = "Server error";
        } finally {
          this.isLoading = false;
        }

      }// Login
      try {
        const payload = {
          name: this.form.name,
          password: this.form.password,
        };
        this.isLoading = true;
        console.log(payload)
        const response = await fetch(this.API_URL + "/auth/login", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload),
          credentials: "include", // Для работы с куками
        });
        console.log(response)
        switch (response.status) {
          case 401:
            this.errorMessage = "Wrong email or password";
            break;
          case 409:
            this.errorMessage = "User does not exist";
            break;
          case 422:
            this.errorMessage = "Validation error. Please check the form.";
            break;
          case 500:
            this.errorMessage = "Server error";
            break;
          case 200:
            this.$router.push("/");
            // TODO добавить ожидание перед переходом на main
            await checkAuth(this.$store);
            break;
        }
      } catch (error) {
        this.errorMessage = "Server error";
      } finally {
        this.isLoading = false;
      }
    },
  },
};

</script>

<style scoped>
.outer-container {
  display: flex;
  justify-content: center;
  margin-top: 6rem
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  font-family: sans-serif;
}

/* Tabs */
.tabs {
  position: relative;
  display: flex;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  overflow: hidden;
}

.tab {
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  border: none;
  text-align: center;
  cursor: pointer;
  transition: color 0.3s;
  font-size: 1rem;
}

.tab:hover {
  background: #f5f5f5;
}

.left-tab.active {
  background-color: transparent;
}

.right-tab.active {
  background-color: transparent;
}

.slider {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50%;
  height: 3px;
  background: #282c34;
  transition: left 0.3s ease;
}

.slider.right {
  left: 50%;
}

/* Form container height animation */
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}

.form-height-enter-active,
.form-height-leave-active {
  transition: all 0.3s ease;
}

.form-height-enter-from,
.form-height-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.form-height-enter-to,
.form-height-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Input groups */
.input-group {
  display: flex;
  flex-direction: column;
}

.input-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form .input-group {
  margin-top: 1rem
}

.input-group input:focus {
  outline: none;
  border-color: #282c34;
}

/* Submit button */
.submit-btn {
  background: #282c34;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;
  min-height: 2.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  background-color: #3a3f4b;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Shake on error */
.error-label {
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

.loading-spinner {
  width: 1rem;
  height: 1rem;
}
</style>
