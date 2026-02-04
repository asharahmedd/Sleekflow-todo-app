export class RegisterUserDTO {
    name: string;
    email: string;
    password: string;
  
    constructor(body: any) {
      // Validate name
      if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
        throw new Error('Name is required and must be a non-empty string');
      }
  
      // Validate email
      if (!body.email || typeof body.email !== 'string') {
        throw new Error('Email is required');
      }
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        throw new Error('Invalid email format');
      }
  
      // Validate password
      if (!body.password || typeof body.password !== 'string') {
        throw new Error('Password is required');
      }
  
      if (body.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
  
      // Assign validated values
      this.name = body.name.trim();
      this.email = body.email.toLowerCase().trim();
      this.password = body.password;
    }
  }