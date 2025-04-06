<template>
  <div class="auth-container">
    <div class="tabs">
      <button :class="{ active: isLogin }" @click="isLogin = true">Логин</button>
      <button :class="{ active: !isLogin }" @click="isLogin = false">Регистрация</button>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="input-group">
        <label>Email</label>
        <input type="email" v-model="form.email" required />
      </div>

      <div class="input-group">
        <label>Пароль</label>
        <input type="password" v-model="form.password" required />
      </div>

      <div v-if="!isLogin" class="input-group">
        <label>Подтвердите пароль</label>
        <input type="password" v-model="form.confirmPassword" required />
      </div>

      <button type="submit">{{ isLogin ? "Войти" : "Зарегистрироваться" }}</button>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLogin: true, // Переключение между логином и регистрацией
      form: {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      errorMessage: "",
    };
  },
  methods: {
    async handleSubmit() {
      this.errorMessage = "";

      if (!this.isLogin && this.form.password !== this.form.confirmPassword) {
        this.errorMessage = "Пароли не совпадают";
        return;
      }

      const endpoint = this.isLogin ? "http://localhost:8000/auth/login" : "http://localhost:8000/auth/register";
      const payload = {
        name: this.form.name,
        email: this.form.email,
        password: this.form.password,
      };

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include", // Для работы с куками
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Ошибка сервера");

        alert(this.isLogin ? "Успешный вход!" : "Регистрация успешна!");
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
  },
};
</script>

<style scoped>
.auth-container {
  width: 30vw;
  min-width: 400px;
  margin: auto;
  padding: 20px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
}
.tabs {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
}
.tabs button {
  flex: 1;
  padding: 10px;
  cursor: pointer;
  border: none;
  transition: background 0.3s, color 0.3s;
}
.tabs button.active {
  background: #282C34;
  color: white;
}
.tabs button:not(.active) {
  background: #ccc;
  color: #282C34;
}
.tabs button:hover {
  background: #282C34;
  color: white;
}
.input-group {
  margin-bottom: 15px;
}
.input-group label {
  display: block;
  margin-bottom: 5px;
}
.input-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 10px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s, color 0.3s;
  background: #282C34;
  color: white;
}
button:hover {
  background: #ccc;
  color: #282C34;
  border: 1px solid #282C34;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
