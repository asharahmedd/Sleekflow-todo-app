import { UserSummaryDTO } from './UserResponseDTO';

export class TodoResponseDTO {
  _id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  createdBy: UserSummaryDTO | string;
  sharedWith: UserSummaryDTO[] | string[];
  createdAt: string;
  updatedAt: string;

  constructor(todo: any) {
    this._id = todo._id.toString();
    this.name = todo.name;
    this.description = todo.description;
    this.status = todo.status;
    this.priority = todo.priority;
    this.dueDate = todo.dueDate ? new Date(todo.dueDate).toISOString() : '';
    
    // Format creator - check if it's populated or just an ID
    if (todo.createdBy) {
      if (typeof todo.createdBy === 'object' && todo.createdBy._id) {
        this.createdBy = new UserSummaryDTO(todo.createdBy);
      } else {
        this.createdBy = todo.createdBy.toString();
      }
    } else {
      this.createdBy = '';
    }
    
    // Format shared users - check if populated or just IDs
    if (todo.sharedWith && Array.isArray(todo.sharedWith)) {
      this.sharedWith = todo.sharedWith.map((user: any) => {
        if (typeof user === 'object' && user._id) {
          return new UserSummaryDTO(user);
        } else {
          return user.toString();
        }
      });
    } else {
      this.sharedWith = [];
    }
    
    this.createdAt = todo.createdAt ? todo.createdAt.toISOString() : '';
    this.updatedAt = todo.updatedAt ? todo.updatedAt.toISOString() : '';
  }
}