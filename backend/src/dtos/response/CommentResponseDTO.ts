import { UserSummaryDTO } from './UserResponseDTO';

export class CommentResponseDTO {
  id: string;
  todoId: string;
  userId: UserSummaryDTO | string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string;

  constructor(comment: any) {
    this.id = comment._id.toString();
    this.todoId = comment.todoId?.toString() || '';
    
    // Format userId - check if populated or just an ID
    if (comment.userId) {
      if (typeof comment.userId === 'object' && comment.userId._id) {
        this.userId = new UserSummaryDTO(comment.userId);
      } else {
        this.userId = comment.userId.toString();
      }
    } else {
      this.userId = '';
    }
    
    this.userName = comment.userName || 'Unknown';
    this.content = comment.content;
    this.createdAt = comment.createdAt ? comment.createdAt.toISOString() : '';
    this.updatedAt = comment.updatedAt ? comment.updatedAt.toISOString() : '';
  }
}