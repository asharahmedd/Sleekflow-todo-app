<script setup lang="ts">
import { computed } from 'vue';
import type { Todo, SharedUser } from '../types/Todo';
import { useAuthStore } from '../stores/authStores';

interface Props {
  todo: Todo;
}

interface Emits {
  (e: 'edit', todo: Todo): void;
  (e: 'delete', id: string): void;
  (e: 'share', todo: Todo): void;
  (e: 'comment', todo: Todo): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const authStore = useAuthStore();

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Not Started':
      return 'status-not-started';
    case 'In Progress':
      return 'status-in-progress';
    case 'Completed':
      return 'status-completed';
    default:
      return '';
  }
};

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'priority-high';
    case 'Medium':
      return 'priority-medium';
    case 'Low':
      return 'priority-low';
    default:
      return 'priority-medium';
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'High':
      return '🔴';
    case 'Medium':
      return '🟡';
    case 'Low':
      return '🟢';
    default:
      return '🟡';
  }
};

// Check if current user is the creator
const isCreator = computed(() => {
  if (typeof props.todo.createdBy === 'string') {
    return props.todo.createdBy === authStore.user?._id;
  }
  return props.todo.createdBy._id === authStore.user?._id;
});

// Get creator name
const creatorName = computed(() => {
  if (typeof props.todo.createdBy === 'string') {
    return 'Someone';
  }
  return props.todo.createdBy.name;
});

// Check if todo is shared
const isShared = computed(() => {
  return Array.isArray(props.todo.sharedWith) && props.todo.sharedWith.length > 0;
});

// Get shared count
const sharedCount = computed(() => {
  return Array.isArray(props.todo.sharedWith) ? props.todo.sharedWith.length : 0;
});
</script>

<template>
  <div class="todo-item" :class="{ 'shared-todo': isShared && !isCreator }">
    <div class="todo-header">
      <h3>{{ todo.name }}</h3>
      <div class="badges">
        <span :class="['priority-badge', getPriorityClass(todo.priority)]">
          {{ getPriorityIcon(todo.priority) }} {{ todo.priority }}
        </span>
        <span :class="['status-badge', getStatusClass(todo.status)]">
          {{ todo.status }}
        </span>
      </div>
    </div>
    
    <!-- Sharing indicators -->
    <div v-if="!isCreator" class="shared-badge">
      📤 Shared by {{ creatorName }}
    </div>
    <div v-else-if="isShared" class="shared-badge shared-with-badge">
      👥 Shared with {{ sharedCount }} {{ sharedCount === 1 ? 'person' : 'people' }}
    </div>
    
    <p class="todo-description">{{ todo.description }}</p>
    <div class="todo-footer">
      <span class="due-date">Due: {{ formatDate(todo.dueDate) }}</span>
      <div class="actions">
        <button @click="emit('comment', todo)" class="btn btn-comment">
          💬 Comments
        </button>
        <button v-if="isCreator" @click="emit('share', todo)" class="btn btn-share">
          👥 Share
        </button>
        <button @click="emit('edit', todo)" class="btn btn-edit">Edit</button>
        <button 
          v-if="isCreator" 
          @click="emit('delete', todo._id)" 
          class="btn btn-delete"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.todo-item {
  background: var(--bg-card);
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  margin-bottom: 12px;
}

.todo-item:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.shared-todo {
  border-left: 3px solid var(--color-primary);
}

.shared-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 12px;
  background: rgba(239, 68, 68, 0.1);
  color: var(--status-error);
}

.shared-with-badge {
  background: var(--color-primary-alpha);
  color: var(--color-primary);
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;
}

.todo-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  line-height: 1.4;
  letter-spacing: -0.2px;
}

.badges {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.priority-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.priority-high {
  background: var(--priority-high);
  color: white;
}

.priority-medium {
  background: var(--priority-medium);
  color: white;
}

.priority-low {
  background: var(--priority-low);
  color: white;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.status-not-started {
  background: var(--text-muted);
  color: white;
}

.status-in-progress {
  background: var(--status-info);
  color: white;
}

.status-completed {
  background: var(--status-success);
  color: white;
}

.todo-description {
  color: var(--text-secondary);
  margin: 12px 0;
  line-height: 1.6;
  font-size: 14px;
}

.todo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.due-date {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.due-date::before {
  content: '📅';
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 14px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  background: transparent;
  color: var(--text-secondary);
}

.btn:hover {
  background: var(--bg-hover);
}

.btn:active {
  transform: scale(0.97);
}

.btn-edit {
  color: var(--status-info);
  border-color: var(--status-info);
}

.btn-edit:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--status-info);
}

.btn-comment {
  color: var(--status-success);
  border-color: var(--status-success);
}

.btn-comment:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--status-success);
}

.btn-share {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.btn-share:hover {
  background: var(--color-primary-alpha);
  border-color: var(--color-primary);
}

.btn-delete {
  color: var(--status-error);
  border-color: var(--status-error);
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--status-error);
}

@media (max-width: 768px) {
  .todo-item {
    padding: 16px;
  }
  
  .todo-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .badges {
    width: 100%;
  }
  
  .todo-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
