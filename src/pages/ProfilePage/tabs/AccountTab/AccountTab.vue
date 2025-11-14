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
import {useChangePassword} from "@/pages/ProfilePage/composables/useChangePassword.js";

export default {
  name: "AccountTab",
  setup() {
    return useChangePassword();
  },
};
</script>
