export class CreateTodoDTO {
    name: string;
    description: string;
    dueDate: Date;
    status?: 'Not Started' | 'In Progress' | 'Completed';
    priority?: 'Low' | 'Medium' | 'High';
  
    constructor(body: any) {
      // Validate name
      if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
        throw new Error('Name is required and must be a non-empty string');
      }
  
      // Validate description
      if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
        throw new Error('Description is required and must be a non-empty string');
      }
  
      // Validate dueDate
      if (!body.dueDate) {
        throw new Error('Due date is required');
      }
  
      const parsedDate = new Date(body.dueDate);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid due date format');
      }
  
      // Validate status (optional)
      if (body.status && !['Not Started', 'In Progress', 'Completed'].includes(body.status)) {
        throw new Error('Invalid status. Must be: Not Started, In Progress, or Completed');
      }
  
      // Validate priority (optional)
      if (body.priority && !['Low', 'Medium', 'High'].includes(body.priority)) {
        throw new Error('Invalid priority. Must be: Low, Medium, or High');
      }
  
      // Assign validated values
      this.name = body.name.trim();
      this.description = body.description.trim();
      this.dueDate = parsedDate;
      this.status = body.status || 'Not Started';
      this.priority = body.priority || 'Medium';
    }
  }