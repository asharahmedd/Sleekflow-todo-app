<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStores';
import { notificationApi } from '../services/notificationApi';
import type { NotificationPreferences } from '../types/Notification';
import type { AxiosError } from 'axios';

const router = useRouter();
const authStore = useAuthStore();

const preferences = ref<NotificationPreferences | null>(null);
const loading = ref(true);
const saving = ref(false);
const testingEmail = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const loadPreferences = async () => {
  try {
    loading.value = true;
    error.value = null;
    preferences.value = await notificationApi.getPreferences();
  } catch (err: unknown) {
    const axiosError = err as AxiosError<{ message?: string }>;
    error.value = axiosError.response?.data?.message || 'Failed to load preferences';
  } finally {
    loading.value = false;
  }
};

const savePreferences = async () => {
  if (!preferences.value) return;

  try {
    saving.value = true;
    error.value = null;
    successMessage.value = null;

    await notificationApi.updatePreferences({
      emailOnTodoShared: preferences.value.emailOnTodoShared,
      emailOnComment: preferences.value.emailOnComment,
      emailOnDueSoon: preferences.value.emailOnDueSoon,
      emailOnOverdue: preferences.value.emailOnOverdue,
      dailyDigest: preferences.value.dailyDigest,
      weeklyDigest: preferences.value.weeklyDigest,
      reminderHours: preferences.value.reminderHours,
      digestTime: preferences.value.digestTime,
    });

    successMessage.value = 'Preferences saved successfully! ✅';
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } catch (err: unknown) {
    const axiosError = err as AxiosError<{ message?: string }>;
    error.value = axiosError.response?.data?.message || 'Failed to save preferences';
  } finally {
    saving.value = false;
  }
};

const sendTestEmail = async () => {
  try {
    testingEmail.value = true;
    error.value = null;
    successMessage.value = null;

    await notificationApi.sendTestEmail();

    successMessage.value = 'Test email sent! Check your inbox 📧';
    setTimeout(() => {
      successMessage.value = null;
    }, 5000);
  } catch (err: unknown) {
    const axiosError = err as AxiosError<{ message?: string }>;
    error.value = axiosError.response?.data?.message || 'Failed to send test email';
  } finally {
    testingEmail.value = false;
  }
};

const goBack = () => {
  router.push('/todos');
};

onMounted(() => {
  loadPreferences();
});
</script>

<template>
  <div id="settings-app">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="btn-back">← Back</button>
          <h1>⚙️ Notification Settings</h1>
        </div>
        <div class="user-info">
          <span class="user-name">👋 {{ authStore.user?.name }}</span>
        </div>
      </div>
    </header>

    <main class="container">
      <div v-if="loading" class="loading">Loading settings...</div>

      <div v-else-if="error && !preferences" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadPreferences" class="btn btn-primary">Retry</button>
      </div>

      <div v-else-if="preferences" class="settings-content">
        <div v-if="successMessage" class="message success-message">
          {{ successMessage }}
        </div>

        <div v-if="error" class="message error-message">
          {{ error }}
        </div>

        <!-- Email Notifications Section -->
        <div class="settings-section">
          <h2>📧 Email Notifications</h2>
          <p class="section-description">
            Choose when you want to receive email notifications
          </p>

          <div class="settings-grid">
            <div class="setting-item">
              <label class="toggle-label">
                <input
                  type="checkbox"
                  v-model="preferences.emailOnTodoShared"
                  class="toggle-input"
                />
                <span class="toggle-slider"></span>
                <span class="toggle-text">
                  <strong>Todo Shared</strong>
                  <small>When someone shares a todo with you</small>
                </span>
              </label>
            </div>

            <div class="setting-item">
              <label class="toggle-label">
                <input
                  type="checkbox"
                  v-model="preferences.emailOnComment"
                  class="toggle-input"
                />
                <span class="toggle-slider"></span>
                <span class="toggle-text">
                  <strong>New Comments</strong>
                  <small>When someone comments on your todos</small>
                </span>
              </label>
            </div>

            <div class="setting-item">
              <label class="toggle-label">
                <input
                  type="checkbox"
                  v-model="preferences.emailOnDueSoon"
                  class="toggle-input"
                />
                <span class="toggle-slider"></span>
                <span class="toggle-text">
                  <strong>Due Soon Reminders</strong>
                  <small>Get reminded before todos are due</small>
                </span>
              </label>
            </div>

            <div class="setting-item">
              <label class="toggle-label">
                <input
                  type="checkbox"
                  v-model="preferences.emailOnOverdue"
                  class="toggle-input"
                />
                <span class="toggle-slider"></span>
                <span class="toggle-text">
                  <strong>Overdue Alerts</strong>
                  <small>When todos pass their due date</small>
                </span>
              </label>
            </div>

            <div class="setting-item full-width">
              <label class="select-label">
                <strong>Reminder Timing</strong>
                <small>How far in advance to send due date reminders</small>
                <select v-model.number="preferences.reminderHours" class="select-input">
                  <option :value="24">24 hours before</option>
                  <option :value="48">48 hours before</option>
                  <option :value="72">72 hours before</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <!-- Digest Emails Section -->
        <div class="settings-section">
          <h2>📊 Digest Emails</h2>
          <p class="section-description">
            Receive summary emails of your todos
          </p>

          <div class="settings-grid">
            <div class="setting-item">
              <label class="toggle-label">
                <input
                  type="checkbox"
                  v-model="preferences.dailyDigest"
                  class="toggle-input"
                />
                <span class="toggle-slider"></span>
                <span class="toggle-text">
                  <strong>Daily Digest</strong>
                  <small>Summary of todos every morning</small>
                </span>
              </label>
            </div>

            <div class="setting-item">
              <label class="toggle-label">
                <input
                  type="checkbox"
                  v-model="preferences.weeklyDigest"
                  class="toggle-input"
                />
                <span class="toggle-slider"></span>
                <span class="toggle-text">
                  <strong>Weekly Digest</strong>
                  <small>Weekly overview every Monday</small>
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          <button 
            @click="savePreferences" 
            :disabled="saving" 
            class="btn btn-primary"
          >
            {{ saving ? 'Saving...' : 'Save Preferences' }}
          </button>

          <button 
            @click="sendTestEmail" 
            :disabled="testingEmail" 
            class="btn btn-secondary"
          >
            {{ testingEmail ? 'Sending...' : '📧 Send Test Email' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
#settings-app {
  min-height: 100vh;
  background: var(--bg-page);
}

/* Header */
.app-header {
  background: var(--color-primary);
  border-bottom: none;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.15);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-back {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.app-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: -0.5px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

/* Container */
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px;
  
}

/* Loading & Error States */
.loading,
.error-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.error-state p {
  color: var(--status-error);
  font-size: 16px;
  margin: 0;
}

/* Settings Content */
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Messages */
.message {
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.success-message {
  background: rgba(16, 185, 129, 0.1);
  color: var(--status-success);
  border: 1px solid var(--status-success);
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  color: var(--status-error);
  border: 1px solid var(--status-error);
}

/* Settings Section */
.settings-section {
  background: var(--bg-card);
  padding: 28px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.settings-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.3px;
}

.section-description {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0 0 24px 0;
}

/* Settings Grid */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
}

.setting-item.full-width {
  grid-column: 1 / -1;
}

/* Toggle Switch */
.toggle-label {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  padding: 16px;
  background: var(--bg-page);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.toggle-label:hover {
  border-color: var(--color-primary);
  background: var(--bg-hover);
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 48px;
  height: 24px;
  background: var(--border-color);
  border-radius: 24px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.toggle-input:checked + .toggle-slider {
  background: var(--color-primary);
}

.toggle-input:checked + .toggle-slider::after {
  transform: translateX(24px);
}

.toggle-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.toggle-text strong {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.toggle-text small {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 400;
}

/* Select Input */
.select-label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--bg-page);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.select-label strong {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.select-label small {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.select-input {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bg-input);
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

/* Actions */
.actions-section {
  display: flex;
  gap: 16px;
  padding-top: 8px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  min-width: 180px;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }

  .settings-section {
    padding: 20px;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .actions-section {
    flex-direction: column;
  }

  .btn-secondary {
    width: 100%;
  }

  .header-content {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
