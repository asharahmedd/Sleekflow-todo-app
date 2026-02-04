export class UpdateTodoDTO {
    name?: string;
    description?: string;
    dueDate?: Date;
    status?: 'Not Started' | 'In Progress' | 'Completed';
    priority?: 'Low' | 'Medium' | 'High';
  
    constructor(body: any) {
      // All fields are optional for updates, but validate if provided
  
      // Validate name if provided
      if (body.name !== undefined) {
        if (typeof body.name !== 'string' || body.name.trim().length === 0) {
          throw new Error('Name must be a non-empty string');
        }
        this.name = body.name.trim();
      }
  
      // Validate description if provided
      if (body.description !== undefined) {
        if (typeof body.description !== 'string' || body.description.trim().length === 0) {
          throw new Error('Description must be a non-empty string');
        }
        this.description = body.description.trim();
      }
  
      // Validate dueDate if provided
      if (body.dueDate !== undefined) {
        const parsedDate = new Date(body.dueDate);
        if (isNaN(parsedDate.getTime())) {
          throw new Error('Invalid due date format');
        }
        this.dueDate = parsedDate;
      }
  
      // Validate status if provided
      if (body.status !== undefined) {
        if (!['Not Started', 'In Progress', 'Completed'].includes(body.status)) {
          throw new Error('Invalid status. Must be: Not Started, In Progress, or Completed');
        }
        this.status = body.status;
      }
  
      // Validate priority if provided
      if (body.priority !== undefined) {
        if (!['Low', 'Medium', 'High'].includes(body.priority)) {
          throw new Error('Invalid priority. Must be: Low, Medium, or High');
        }
        this.priority = body.priority;
      }
    }
  
    // Helper method to get only defined fields
    toObject(): any {
      const obj: any = {};
      if (this.name !== undefined) obj.name = this.name;
      if (this.description !== undefined) obj.description = this.description;
      if (this.dueDate !== undefined) obj.dueDate = this.dueDate;
      if (this.status !== undefined) obj.status = this.status;
      if (this.priority !== undefined) obj.priority = this.priority;
      return obj;
    }
  }