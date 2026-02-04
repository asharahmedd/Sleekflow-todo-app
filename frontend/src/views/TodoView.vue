<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStores';
import { useTheme } from '../composables/useTheme';
import TodoForm from '../components/TodoForm.vue';
import TodoItem from '../components/TodoItem.vue';
import ActivityFeed from '../components/ActivityFeed.vue';
import ShareTodoModal from '../components/ShareTodoModal.vue';
import CommentSection from '../components/CommentSection.vue';
import { socketService } from '../services/socketService';
import { todoApi } from '../services/todoApi';
import type { Todo, CreateTodoInput, TodoStatus, TodoPriority } from '../types/Todo';
import type { Activity } from '../types/Activity';

const router = useRouter();
const authStore = useAuthStore();
const { theme, toggleTheme } = useTheme();

const todos = ref<Todo[]>([]);
const editingTodo = ref<Todo | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const showShareModal = ref(false);
const todoToShare = ref<Todo | null>(null);
const showCommentSection = ref(false);
const todoForComments = ref<Todo | null>(null);

// Filtering and Sorting
const filterStatus = ref<TodoStatus | 'All'>('All');
const filterPriority = ref<TodoPriority | 'All'>('All');
const sortBy = ref<'dueDate' | 'status' | 'name' | 'priority'>('dueDate');
const sortOrder = ref<'asc' | 'desc'>('asc');
const searchQuery = ref('');

// Filtered and sorted todos
const filteredAndSortedTodos = computed(() => {
  let result = [...todos.value];

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(todo => 
      todo.name.toLowerCase().includes(query) ||
      todo.description.toLowerCase().includes(query)
    );
  }

  // Apply status filter
  if (filterStatus.value !== 'All') {
    result = result.filter(todo => todo.status === filterStatus.value);
  }

  // Apply priority filter
  if (filterPriority.value !== 'All') {
    result = result.filter(todo => todo.priority === filterPriority.value);
  }

  // Apply sorting
  result.sort((a, b) => {
    let comparison = 0;

    if (sortBy.value === 'dueDate') {
      comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortBy.value === 'status') {
      const statusOrder = { 'Not Started': 0, 'In Progress': 1, 'Completed': 2 };
      comparison = statusOrder[a.status] - statusOrder[b.status];
    } else if (sortBy.value === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy.value === 'priority') {
      const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    return sortOrder.value === 'asc' ? comparison : -comparison;
  });

  return result;
});

// Fetch all todos
const fetchTodos = async () => {
  loading.value = true;
  error.value = null;
  try {
    todos.value = await todoApi.getAllTodos();
  } catch (err) {
    error.value = 'Failed to fetch todos';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Create or update todo
const handleSubmit = async (todoData: CreateTodoInput) => {
  try {
    if (editingTodo.value) {
      await todoApi.updateTodo(editingTodo.value._id, todoData);
      editingTodo.value = null;
    } else {
      await todoApi.createTodo(todoData);
    }
    await fetchTodos();
  } catch (err) {
    alert('Failed to save todo');
    console.error(err);
  }
};

// Delete todo
const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this todo?')) {
    try {
      await todoApi.deleteTodo(id);
      await fetchTodos();
    } catch (err) {
      alert('Failed to delete todo');
      console.error(err);
    }
  }
};

// Edit todo
const handleEdit = (todo: Todo) => {
  editingTodo.value = todo;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Cancel editing
const handleCancel = () => {
  editingTodo.value = null;
};

// Share todo
const handleShare = (todo: Todo) => {
  todoToShare.value = todo;
  showShareModal.value = true;
};

// Close share modal
const handleCloseShare = () => {
  showShareModal.value = false;
  todoToShare.value = null;
};

// Refresh todos after sharing
const handleShareUpdated = () => {
  fetchTodos();
};

// Comments
const handleComment = (todo: Todo) => {
  todoForComments.value = todo;
  showCommentSection.value = true;
};

const handleCloseComments = () => {
  showCommentSection.value = false;
  todoForComments.value = null;
};

const handleCommentAdded = () => {
  // Optionally refresh todos or update count
};

// Logout
const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

// Listen for real-time updates
onMounted(() => {
  if (authStore.user) {
    socketService.connect(authStore.user._id);
  }
  
  // Listen for sharing activities
  socketService.on('new-activity', (activity: Activity) => {
    if (activity.type === 'todo_shared' || activity.type === 'todo_unshared') {
      // Refresh todos if sharing affects current user
      fetchTodos();
    }
  });
  
  fetchTodos();
});

// Disconnect socket when component unmounts
onUnmounted(() => {
  socketService.disconnect();
});
</script> 

<template>
  <div id="todo-app">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <h1>SleekFlow - Todo List</h1>
          <span class="user-name">Hello, {{ authStore.user?.name }}</span>
        </div>
        <div class="user-info">
          <button @click="toggleTheme" class="btn-theme" :title="theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'">
            {{ theme === 'light' ? 'Dark Mode' : 'Light Mode' }}
          </button>
          <button @click="router.push('/settings')" class="btn-settings" title="Notification Settings">
            Settings
          </button>
          
          <button @click="handleLogout" class="btn-logout">Logout</button>
        </div>
      </div>
    </header>

    <!-- Activity Feed -->
    <ActivityFeed />

    <main class="container">
      <TodoForm
        :editingTodo="editingTodo"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />

      <div class="todos-section">
        <div class="section-header">
          <h2>All Todos ({{ filteredAndSortedTodos.length }})</h2>
          
          <!-- Filter and Sort Controls -->
          <div class="controls">
            <!-- Search Box -->
            <div class="control-group search-group">
              <label>🔍 Search:</label>
              <div class="search-wrapper">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search todos..."
                  class="search-input"
                />
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  class="clear-search-btn"
                  title="Clear search"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- Filter by Status -->
            <div class="control-group">
              <label>📊 Status:</label>
              <select v-model="filterStatus" class="control-select">
                <option value="All">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <!-- Filter by Priority -->
            <div class="control-group">
              <label>🎯 Priority:</label>
              <select v-model="filterPriority" class="control-select">
                <option value="All">All Priorities</option>
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>

            <!-- Sort By -->
            <div class="control-group">
              <label>🔄 Sort By:</label>
              <select v-model="sortBy" class="control-select">
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="name">Name</option>
              </select>
            </div>

            <!-- Sort Order -->
            <div class="control-group">
              <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'" class="btn-sort">
                {{ sortOrder === 'asc' ? '⬆️ Ascending' : '⬇️ Descending' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="loading" class="loading">Loading todos...</div>

        <div v-else-if="error" class="error">{{ error }}</div>

        <div v-else-if="todos.length === 0" class="empty-state">
          <p>No todos yet. Create your first one above! 🎯</p>
        </div>

        <div v-else-if="filteredAndSortedTodos.length === 0" class="empty-state">
          <p>No todos match your filters 🔍</p>
        </div>

        <div v-else class="todos-list">
          <TodoItem
            v-for="todo in filteredAndSortedTodos"
            :key="todo._id"
            :todo="todo"
            @edit="handleEdit"
            @delete="handleDelete"
            @share="handleShare"
            @comment="handleComment"
          />
        </div>
      </div>
    </main>

    <!-- Share Modal -->
    <ShareTodoModal
      v-if="showShareModal && todoToShare"
      :todo="todoToShare"
      @close="handleCloseShare"
      @updated="handleShareUpdated"
    />

    <!-- Comment Section -->
    <CommentSection
      v-if="showCommentSection && todoForComments"
      :todoId="todoForComments._id"
      @close="handleCloseComments"
      @commentAdded="handleCommentAdded"
    />
  </div>
</template>

<style scoped>
#todo-app {
  min-height: 100vh;
  background: var(--bg-page);
}

/* ===== HEADER ===== */
.app-header {
  background: var(--color-primary);
  border-bottom: none;
  padding: 20px 32px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.15);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.5px;
  margin: 0;
}
.header-left {
  display: flex;
  align-items: baseline;
  gap: 20px;
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

.btn-theme,
.btn-settings {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
}

.btn-theme:hover,
.btn-settings:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.btn-logout {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.logo-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-greeting {
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
}

/* ===== CONTAINER ===== */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
  display: flex;
    flex-direction: column;
    align-items: center;
}

/* ===== TODOS SECTION ===== */
.todos-section {
  width: 89%
}

.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  letter-spacing: -0.3px;
}

/* ===== CONTROLS ===== */
.controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  background: var(--bg-card);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.search-group {
  flex: 1;
  min-width: 250px;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bg-input);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s;
}

.clear-search-btn:hover {
  color: var(--text-primary);
}

.control-select {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  background: var(--bg-input);
  cursor: pointer;
  transition: all 0.2s;
}

.control-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.btn-sort {
  padding: 10px 16px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-sort:hover {
  background: var(--bg-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* ===== STATES ===== */
.loading,
.error,
.empty-state {
  text-align: center;
  padding: 60px 24px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-top: 24px;
}

.loading {
  color: var(--text-secondary);
  font-size: 14px;
}

.error {
  color: var(--status-error);
  font-size: 14px;
  font-weight: 500;
}

.empty-state {
  color: var(--text-muted);
  font-size: 14px;
}

.empty-state p {
  margin: 0;
}

/* ===== TODOS LIST ===== */
.todos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
  
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    width: 100%;
  }
  
  .search-group {
    min-width: 100%;
  }
}
</style>
