<template>
  <div class="todo-form">
    <h2>{{ editingTodo ? 'Edit Todo' : 'Add New Todo' }}</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">Name:</label>
        <input
          id="name"
          v-model="name"
          type="text"
          placeholder="Enter todo name"
          required
        />
      </div>

      <div class="form-group">
        <label for="description">Description:</label>
        <textarea
          id="description"
          v-model="description"
          placeholder="Enter description"
          rows="3"
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="dueDate">Due Date:</label>
        <input id="dueDate" v-model="dueDate" type="date" required />
      </div>

      <div class="form-group">
        <label for="status">Status:</label>
        <select id="status" v-model="status">
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div class="form-group">
        <label for="priority">Priority:</label>
        <select id="priority" v-model="priority" class="priority-select">
          <option value="Low">🟢 Low</option>
          <option value="Medium">🟡 Medium</option>
          <option value="High">🔴 High</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">
          {{ editingTodo ? 'Update' : 'Create' }}
        </button>
        <button
          v-if="editingTodo"
          type="button"
          @click="handleCancel"
          class="btn btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Todo, TodoStatus, TodoPriority, CreateTodoInput } from '../types/Todo';

interface Props {
  editingTodo?: Todo | null;
}

interface Emits {
  (e: 'submit', todo: CreateTodoInput): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const name = ref('');
const description = ref('');
const dueDate = ref('');
const status = ref<TodoStatus>('Not Started');
const priority = ref<TodoPriority>('Medium');

const resetForm = () => {
  name.value = '';
  description.value = '';
  dueDate.value = '';
  status.value = 'Not Started';
  priority.value = 'Medium';
};

// Watch for editing todo changes
watch(
  () => props.editingTodo,
  (todo) => {
    if (todo) {
      name.value = todo.name;
      description.value = todo.description;
      dueDate.value = todo.dueDate.split('T')[0] || ''; // Format for input[type="date"]
      status.value = todo.status;
      priority.value = todo.priority || 'Medium';
    } else {
      resetForm();
    }
  },
  { immediate: true }
);



const handleSubmit = () => {
  if (!name.value || !description.value || !dueDate.value) {
    alert('Please fill in all fields');
    return;
  }

  emit('submit', {
    name: name.value,
    description: description.value,
    dueDate: dueDate.value,
    status: status.value,
    priority: priority.value,
  });

  if (!props.editingTodo) {
    resetForm();
  }
};

const handleCancel = () => {
  resetForm();
  emit('cancel');
};
</script>

<style scoped>
.todo-form {
  background: var(--bg-card);
  padding: 28px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  margin-bottom: 24px;
  width: 100%;
  max-width: 1200px;
}

.todo-form h2 {
  margin: 0 0 24px 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.3px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 13px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
  background: var(--bg-input);
  color: var(--text-primary);
  font-weight: 400;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.form-group select {
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 10px 20px;
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

.btn-primary:hover {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  min-width: 100px;
}

.btn-secondary:hover {
  background: var(--bg-hover);
  border-color: var(--text-secondary);
}

.btn-secondary:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .todo-form {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn-secondary {
    width: 100%;
  }
}
</style>