<template>
  <div class="change-password-wrapper">
    <h1>Change password</h1>
    <input
        type="password"
        placeholder="Old password"
        v-model.trim="oldPassword"
        @keydown="preventWhitespace"
        @input="resetPasswordLog"
        required
    />
    <input
        type="password"
        placeholder="New password"
        v-model.trim="newPassword"
        @keydown="preventWhitespace"
        @input="resetPasswordLog"
        required
    />
    <input
        type="password"
        placeholder="Confirm password"
        v-model.trim="confirmPassword"
        @keydown="preventWhitespace"
        @input="resetPasswordLog"
        required
    />
    <button class="gradient" type="submit" @click="changePassword">
      <span v-if="!isPatchingPassword">Change password</span>
      <spinner v-else />
    </button>
    <transition name="shake">
      <label v-if="passwordLog" :class="{ success: succeedPasswordChange }">
        {{ passwordLog }}
      </label>
    </transition>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "AccountTab",
  setup() {
    const oldPassword = ref("");
    const newPassword = ref("");
    const confirmPassword = ref("");
    const passwordLog = ref("");
    const succeedPasswordChange = ref(false);
    const isPatchingPassword = ref(false);

    const API_URL = import.meta.env.VITE_API_URL;

    const resetPasswordLog = () => {
      passwordLog.value = "";
    };

    const preventWhitespace = (event) => {
      if (event.key.match(/\s/)) {
        event.preventDefault();
      }
    };

    const changePassword = async () => {
      if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
        passwordLog.value = "All fields are required";
        return;
      }

      resetPasswordLog();

      if (newPassword.value !== confirmPassword.value) {
        passwordLog.value = "Passwords don't match";
        return;
      }

      const payload = {
        oldPassword: oldPassword.value,
        newPassword: newPassword.value,
      };

      try {
        isPatchingPassword.value = true;

        const response = await fetch(`${API_URL}/auth/password`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (response.status === 403) {
          passwordLog.value = "Wrong old password";
          return;
        }

        succeedPasswordChange.value = true;
        passwordLog.value = "Password changed successfully";

        oldPassword.value = "";
        newPassword.value = "";
        confirmPassword.value = "";
      } catch (error) {
        passwordLog.value = "Error changing password";
      } finally {
        isPatchingPassword.value = false;
      }
    };

    return {
      oldPassword,
      newPassword,
      confirmPassword,
      passwordLog,
      succeedPasswordChange,
      isPatchingPassword,
      resetPasswordLog,
      preventWhitespace,
      changePassword,
    };
  },
};
</script>

<style scoped>
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
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}
</style>
