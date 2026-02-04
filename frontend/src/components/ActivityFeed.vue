<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { socketService } from '../services/socketService';
import { activityApi } from '../services/activityApi';
import type { Activity } from '../types/Activity';

const activities = ref<Activity[]>([]);
const isVisible = ref(true); // Always visible now
const toastNotification = ref<Activity | null>(null);
const showToast = ref(false);

const loadActivities = async () => {
  try {
    activities.value = await activityApi.getRecentActivities();
  } catch (error) {
    console.error('Failed to load activities:', error);
  }
};

const showToastNotification = (activity: Activity) => {
  toastNotification.value = activity;
  showToast.value = true;
  
  // Request browser notification permission and show native notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('New Activity', {
      body: activity.message,
      icon: '/vite.svg',
      tag: activity._id,
    });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification('New Activity', {
          body: activity.message,
          icon: '/vite.svg',
          tag: activity._id,
        });
      }
    });
  }
  
  // Auto-hide after 4 seconds
  setTimeout(() => {
    showToast.value = false;
  }, 4000);
};

const handleNewActivity = (activity: Activity) => {
  // Add new activity to the beginning of the list
  activities.value.unshift(activity);
  // Keep only last 50
  if (activities.value.length > 50) {
    activities.value.pop();
  }
  
  // Show toast notification
  showToastNotification(activity);
};

const getActivityIcon = (type: string) => {
  const icons: Record<string, string> = {
    user_registered: '👋',
    user_logged_in: '🔓',
    user_logged_out: '🔒',
    todo_created: '➕',
    todo_updated: '✏️',
    todo_status_changed: '🔄',
    todo_priority_changed: '🎯',
    todo_completed: '✅',
    todo_deleted: '🗑️',
    todo_shared: '👥',
    todo_unshared: '🔓',
    comment_added: '💬',
    comment_updated: '✏️',
    comment_deleted: '🗑️',
  };
  return icons[type] || '📝';
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

const toggleFeed = () => {
  isVisible.value = !isVisible.value;
};

onMounted(() => {
  loadActivities();
  socketService.on('new-activity', handleNewActivity);
});

onUnmounted(() => {
  socketService.off('new-activity', handleNewActivity);
});
</script>

<template>
  <div class="activity-feed-container">
    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="showToast && toastNotification" class="toast-notification" @click="showToastNotification(toastNotification)">
        <div class="toast-icon">{{ getActivityIcon(toastNotification.type) }}</div>
        <div class="toast-content">
          <p class="toast-message">{{ toastNotification.message }}</p>
          <span class="toast-time">{{ formatTime(toastNotification.timestamp) }}</span>
        </div>
        <button class="toast-close">✕</button>
      </div>
    </transition>

    <!-- Activity Feed Panel - Always Visible -->
    <transition name="slide">
      <div v-if="isVisible" class="activity-feed-panel">
        <div class="feed-header">
          <h3>🔔 Activity Feed</h3>
          <button @click="toggleFeed" class="minimize-btn" :title="isVisible ? 'Minimize' : 'Show'">
            {{ isVisible ? '−' : '+' }}
          </button>
        </div>

        <div class="activity-list">
          <div
            v-for="activity in activities"
            :key="activity._id"
            class="activity-item"
          >
            <div class="activity-icon">{{ getActivityIcon(activity.type) }}</div>
            <div class="activity-content">
              <p class="activity-message">{{ activity.message }}</p>
              <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
            </div>
          </div>

          <div v-if="activities.length === 0" class="empty-state">
            <p>No activities yet</p>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Minimized Toggle Button (only shows when minimized) -->
    <button v-if="!isVisible" @click="toggleFeed" class="feed-toggle-btn-minimized">
      <span class="icon">🔔</span>
      <span v-if="activities.length > 0" class="badge">{{ activities.length }}</span>
    </button>
  </div>
</template>

<style scoped>
.activity-feed-container {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  z-index: 1000;
}

/* Toast Notification Styles */
.toast-notification {
  position: fixed;
  bottom: 40px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  min-width: 320px;
  max-width: 420px;
  background: var(--color-primary);
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 102, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  z-index: 9999;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-notification:hover {
  box-shadow: 0 8px 24px rgba(0, 102, 255, 0.4);
  transform: translateY(-2px);
}

.toast-icon {
  font-size: 24px;
}

.toast-content {
  flex: 1;
}

.toast-message {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: white;
  font-weight: 500;
  line-height: 1.4;
}

.toast-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

.toast-close {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 16px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}

/* Toast transition */
.toast-enter-active {
  animation: slideInRight 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* Minimized Toggle Button */
.feed-toggle-btn-minimized {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 48px;
  height: 48px;
  background: var(--color-primary);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
  z-index: 999;
}

.feed-toggle-btn-minimized:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-lg);
}

.feed-toggle-btn-minimized .icon {
  font-size: 22px;
}

.feed-toggle-btn-minimized .badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--status-error);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
  min-width: 18px;
}

.icon {
  font-size: 18px;
}

.badge {
  background: var(--status-error);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

/* Activity Feed Panel - Now a Sidebar */
.activity-feed-panel {
  position: fixed;
  top: 73px;
  right: 0;
  width: 350px;
  height: 100vh;
  background: var(--bg-card);
  box-shadow: var(--shadow-lg);
  border-left: 1px solid var(--border-color);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: var(--color-primary);
  color: white;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.feed-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.minimize-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 20px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
}

.minimize-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}

.activity-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background: var(--bg-page);
  border-radius: 8px;
  border-left: 3px solid var(--color-primary);
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 102, 255, 0.08);
}

.activity-item:hover {
  background: var(--bg-hover);
  transform: translateX(-2px);
  border-left-width: 4px;
  box-shadow: 0 2px 6px rgba(0, 102, 255, 0.15);
}

.activity-icon {
  font-size: 20px;
  line-height: 1;
  background: var(--color-primary-alpha);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.activity-content {
  flex: 1;
}

.activity-message {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
  line-height: 1.4;
}

.activity-time {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 400;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Scrollbar styling */
.activity-list::-webkit-scrollbar {
  width: 6px;
}

.activity-list::-webkit-scrollbar-track {
  background: var(--bg-page);
}

.activity-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* Responsive */
@media (max-width: 1400px) {
  .activity-feed-panel {
    width: 300px;
  }
  
  .toast-notification {
    right: 33px;
  }
}

@media (max-width: 768px) {
  .activity-feed-panel {
    width: 100%;
    max-width: 100vw;
  }
  
  .toast-notification {
    right: 12px;
    left: 12px;
    min-width: auto;
    max-width: calc(100vw - 24px);
  }
  
  .feed-toggle-btn-minimized {
    right: 12px;
  }
}
</style>