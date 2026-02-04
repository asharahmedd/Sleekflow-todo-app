export type TodoStatus = 'Not Started' | 'In Progress' | 'Completed';
export type TodoPriority = 'Low' | 'Medium' | 'High';

export interface SharedUser {
  _id: string;
  name: string;
  email: string;
}

export interface Todo {
  _id: string;
  createdBy: string | SharedUser;
  sharedWith: string[] | SharedUser[];
  name: string;
  description: string;
  dueDate: string;
  status: TodoStatus;
  priority: TodoPriority;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  name: string;
  description: string;
  dueDate: string;
  status: TodoStatus;
  priority: TodoPriority;
}

export interface UpdateTodoInput {
  name?: string;
  description?: string;
  dueDate?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
}