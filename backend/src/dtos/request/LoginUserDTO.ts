export class LoginUserDTO {
    email: string;
    password: string;
  
    constructor(body: any) {
      // Validate email
      if (!body.email || typeof body.email !== 'string' || body.email.trim().length === 0) {
        throw new Error('Email is required');
      }
  
      // Validate password
      if (!body.password || typeof body.password !== 'string' || body.password.trim().length === 0) {
        throw new Error('Password is required');
      }
  
      // Assign validated values
      this.email = body.email.toLowerCase().trim();
      this.password = body.password;
    }
  }