<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { commentApi } from '../services/commentApi';
import { socketService } from '../services/socketService';
import { useAuthStore } from '../stores/authStores';
import type { Comment } from '../types/Comment';

interface Props {
  todoId: string;
}

interface Emits {
  (e: 'close'): void;
  (e: 'commentAdded'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const authStore = useAuthStore();

const comments = ref<Comment[]>([]);
const newComment = ref('');
const editingCommentId = ref<string | null>(null);
const editContent = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

const loadComments = async () => {
  try {
    loading.value = true;
    error.value = null;
    comments.value = await commentApi.getComments(props.todoId);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load comments';
  } finally {
    loading.value = false;
  }
};

const handleAddComment = async () => {
  if (!newComment.value.trim()) return;

  try {
    const comment = await commentApi.createComment(props.todoId, {
      content: newComment.value.trim(),
    });
    comments.value.unshift(comment); // Add to top
    newComment.value = '';
    emit('commentAdded');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to add comment';
  }
};

const startEdit = (comment: Comment) => {
  editingCommentId.value = comment._id;
  editContent.value = comment.content;
};

const cancelEdit = () => {
  editingCommentId.value = null;
  editContent.value = '';
};

const handleUpdateComment = async (commentId: string) => {
  if (!editContent.value.trim()) return;

  try {
    const updated = await commentApi.updateComment(commentId, {
      content: editContent.value.trim(),
    });
    const index = comments.value.findIndex((c) => c._id === commentId);
    if (index !== -1) {
      comments.value[index] = updated;
    }
    cancelEdit();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to update comment';
  }
};

const handleDeleteComment = async (commentId: string) => {
  if (!confirm('Are you sure you want to delete this comment?')) return;

  try {
    await commentApi.deleteComment(commentId);
    comments.value = comments.value.filter((c) => c._id !== commentId);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to delete comment';
  }
};

const isOwnComment = (comment: Comment) => {
  return comment.userId === authStore.user?._id;
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

const isEdited = (comment: Comment) => {
  return comment.updatedAt !== comment.createdAt;
};

// Listen for real-time comment updates
const handleNewActivity = (activity: any) => {
  if (
    activity.todoId === props.todoId &&
    (activity.type === 'comment_added' ||
      activity.type === 'comment_updated' ||
      activity.type === 'comment_deleted')
  ) {
    loadComments();
  }
};

onMounted(() => {
  loadComments();
  socketService.on('new-activity', handleNewActivity);
});
</script>

<template>
  <div class="comment-section-overlay" @click.self="$emit('close')">
    <div class="comment-section">
      <div class="comment-header">
        <h3>💬 Comments ({{ comments.length }})</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <div class="comment-body">
        <!-- Add Comment Form -->
        <div class="add-comment">
          <textarea
            v-model="newComment"
            placeholder="Add a comment..."
            rows="3"
            class="comment-input"
            @keydown.ctrl.enter="handleAddComment"
          ></textarea>
          <button
            @click="handleAddComment"
            :disabled="!newComment.trim()"
            class="btn btn-primary"
          >
            Post Comment
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">{{ error }}</div>

        <!-- Loading State -->
        <div v-if="loading" class="loading">Loading comments...</div>

        <!-- Empty State -->
        <div v-else-if="comments.length === 0" class="empty-comments">
          <p>No comments yet. Be the first to comment! 💭</p>
        </div>

        <!-- Comments List -->
        <div v-else class="comments-list">
          <div
            v-for="comment in comments"
            :key="comment._id"
            class="comment-item"
            :class="{ 'own-comment': isOwnComment(comment) }"
          >
            <div class="comment-header-item">
              <span class="comment-author">{{ comment.userName }}</span>
              <span class="comment-time">
                {{ formatTime(comment.createdAt) }}
                <span v-if="isEdited(comment)" class="edited-badge">(edited)</span>
              </span>
            </div>

            <!-- Editing Mode -->
            <div v-if="editingCommentId === comment._id" class="edit-mode">
              <textarea
                v-model="editContent"
                rows="3"
                class="comment-input"
              ></textarea>
              <div class="edit-actions">
                <button @click="handleUpdateComment(comment._id)" class="btn btn-save">
                  Save
                </button>
                <button @click="cancelEdit" class="btn btn-cancel">Cancel</button>
              </div>
            </div>

            <!-- View Mode -->
            <div v-else>
              <p class="comment-content">{{ comment.content }}</p>
              <div v-if="isOwnComment(comment)" class="comment-actions">
                <button @click="startEdit(comment)" class="btn-text">Edit</button>
                <button @click="handleDeleteComment(comment._id)" class="btn-text delete">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-section-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.comment-section {
  background: var(--bg-card);
  border-radius: 24px;
  width: 100%;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 2px solid var(--border-color);
}

.comment-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.3s;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--text-primary);
  transform: rotate(90deg);
}

.comment-body {
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;
}

.add-comment {
  margin-bottom: 24px;
}

.comment-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 12px;
  background: var(--bg-input);
  color: var(--text-primary);
  transition: all 0.3s;
}

.comment-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 16px;
}

.empty-comments {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-comments p {
  margin: 0;
  font-size: 16px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  background: var(--bg-input);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  padding: 16px 20px;
  transition: all 0.3s;
}

.comment-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.comment-item.own-comment {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-color: rgba(102, 126, 234, 0.3);
}

.comment-header-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.comment-author {
  font-weight: 700;
  font-size: 15px;
  color: var(--text-primary);
}

.comment-time {
  font-size: 12px;
  color: var(--text-muted);
}

.edited-badge {
  font-style: italic;
  margin-left: 4px;
}

.comment-content {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  word-wrap: break-word;
}

.comment-actions {
  margin-top: 12px;
  display: flex;
  gap: 16px;
}

.btn-text {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s;
}

.btn-text:hover {
  color: #764ba2;
  text-decoration: underline;
}

.btn-text.delete {
  color: #e74c3c;
}

.btn-text.delete:hover {
  color: #c0392b;
}

.edit-mode {
  margin-top: 12px;
}

.edit-actions {
  display: flex;
  gap: 12px;
}

.btn-save {
  background: #27ae60;
  color: white;
}

.btn-save:hover {
  background: #229954;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background: #7f8c8d;
}
</style>
