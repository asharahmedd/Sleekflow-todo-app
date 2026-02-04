<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { todoApi } from '../services/todoApi';
import { authApi } from '../services/AuthApi';
import type { Todo, SharedUser } from '../types/Todo';
import type { User } from '../types/Auth';

const props = defineProps<{
  todo: Todo;
}>();

const emit = defineEmits<{
  close: [];
  updated: [];
}>();

const searchQuery = ref('');
const searchResults = ref<User[]>([]);
const sharedUsers = ref<SharedUser[]>([]);
const creator = ref<SharedUser | null>(null);
const isSearching = ref(false);
const error = ref('');
const successMessage = ref('');

// Get creator info
const creatorName = computed(() => {
  if (typeof props.todo.createdBy === 'string') {
    return 'Owner';
  }
  return props.todo.createdBy.name;
});

// Load shared users
const loadSharedUsers = async () => {
  try {
    const data = await todoApi.getSharedUsers(props.todo._id);
    creator.value = data.creator;
    sharedUsers.value = data.sharedWith;
  } catch (err: any) {
    console.error('Error loading shared users:', err);
  }
};

// Search users
const searchUsers = async () => {
  if (!searchQuery.value || searchQuery.value.length < 2) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  try {
    const users = await authApi.searchUsers(searchQuery.value);
    searchResults.value = users;
  } catch (err: any) {
    console.error('Error searching users:', err);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
};

// Share with user
const shareWithUser = async (user: User) => {
  error.value = '';
  successMessage.value = '';

  try {
    await todoApi.shareWithUser(props.todo._id, user.email);
    successMessage.value = `Shared with ${user.name}!`;
    searchQuery.value = '';
    searchResults.value = [];
    await loadSharedUsers();
    emit('updated');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to share todo';
  }
};

// Remove shared user
const removeUser = async (userId: string) => {
  error.value = '';
  successMessage.value = '';

  try {
    await todoApi.unshareWithUser(props.todo._id, userId);
    successMessage.value = 'User removed successfully!';
    await loadSharedUsers();
    emit('updated');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to remove user';
  }
};

onMounted(() => {
  loadSharedUsers();
});
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="share-modal">
      <div class="modal-header">
        <h3>👥 Share "{{ todo.name }}"</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <div class="modal-body">
        <!-- Error/Success Messages -->
        <div v-if="error" class="message error-message">{{ error }}</div>
        <div v-if="successMessage" class="message success-message">{{ successMessage }}</div>

        <!-- Search Users -->
        <div class="search-section">
          <label>Add People</label>
          <input
            v-model="searchQuery"
            @input="searchUsers"
            type="text"
            placeholder="Search by name or email..."
            class="search-input"
          />

          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="search-results">
            <div
              v-for="user in searchResults"
              :key="user._id"
              class="search-result-item"
              @click="shareWithUser(user)"
            >
              <div class="user-info">
                <div class="user-avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
                <div>
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
              </div>
              <button class="add-btn">+ Add</button>
            </div>
          </div>

          <div v-else-if="isSearching" class="search-loading">
            Searching...
          </div>

          <div v-else-if="searchQuery.length >= 2 && searchResults.length === 0" class="no-results">
            No users found
          </div>
        </div>

        <!-- Current Shared Users -->
        <div class="shared-users-section">
          <label>People with Access</label>

          <!-- Creator -->
          <div class="user-item creator">
            <div class="user-info">
              <div class="user-avatar creator-avatar">
                {{ creatorName.charAt(0).toUpperCase() }}
              </div>
              <div>
                <div class="user-name">{{ creatorName }}</div>
                <div class="user-role">Owner</div>
              </div>
            </div>
          </div>

          <!-- Shared Users -->
          <div v-for="user in sharedUsers" :key="user._id" class="user-item">
            <div class="user-info">
              <div class="user-avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
              <div>
                <div class="user-name">{{ user.name }}</div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </div>
            <button @click="removeUser(user._id)" class="remove-btn">Remove</button>
          </div>

          <div v-if="sharedUsers.length === 0" class="no-shared-users">
            Not shared with anyone yet
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.share-modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 550px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 24px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
  max-height: calc(80vh - 80px);
  overflow-y: auto;
}

.message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
}

.error-message {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.success-message {
  background: #efe;
  color: #3a3;
  border: 1px solid #cfc;
}

.search-section,
.shared-users-section {
  margin-bottom: 24px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-results {
  margin-top: 8px;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: #f8f9fa;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.creator-avatar {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.user-email,
.user-role {
  font-size: 12px;
  color: #95a5a6;
}

.add-btn {
  padding: 6px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.search-loading,
.no-results {
  padding: 16px;
  text-align: center;
  color: #95a5a6;
  font-size: 14px;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.user-item:hover {
  background: #eef0f2;
}

.user-item.creator {
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%);
  border: 2px solid rgba(245, 87, 108, 0.2);
}

.remove-btn {
  padding: 6px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.remove-btn:hover {
  background: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

.no-shared-users {
  padding: 24px;
  text-align: center;
  color: #95a5a6;
  font-size: 14px;
}

/* Scrollbar */
.modal-body::-webkit-scrollbar,
.search-results::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track,
.search-results::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb,
.search-results::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb:hover,
.search-results::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
