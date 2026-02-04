<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStores';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

const handleLogin = async () => {
  const success = await authStore.login({
    email: email.value,
    password: password.value,
  });

  if (success) {
    router.push('/todos');
  }
};
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Welcome Back</h1>
        <p>Sign in to manage your todos</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
            autocomplete="current-password"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
        </button>

        <div class="auth-footer">
          <p>
            Don't have an account?
            <router-link to="/register">Create one</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--bg-page);
}

.auth-card {
  background: var(--bg-card);
  padding: 40px;
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 420px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.auth-header p {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  color: var(--status-error);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  border: 1px solid var(--status-error);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-group input {
  padding: 12px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  transition: all 0.2s ease;
  background: var(--bg-input);
  color: var(--text-primary);
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 8px;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.auth-footer p {
  color: var(--text-secondary);
  font-size: 13px;
  margin: 0;
}

.auth-footer a {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.auth-footer a:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .auth-card {
    padding: 32px 24px;
  }

  .auth-header h1 {
    font-size: 24px;
  }
}
</style>