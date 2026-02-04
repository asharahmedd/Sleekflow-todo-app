export interface Comment {
  _id: string;
  todoId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentInput {
  content: string;
}

export interface UpdateCommentInput {
  content: string;
}
