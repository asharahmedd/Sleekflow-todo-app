export class UserResponseDTO {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
  
    constructor(user: any) {
      this._id = user._id.toString();
      this.name = user.name;
      this.email = user.email;
      this.createdAt = user.createdAt ? user.createdAt.toISOString() : new Date().toISOString();
      // Notice: NO password field - keeps it secure!
    }
  }
  
  // Simple version for nested user references (e.g., todo creator)
  export class UserSummaryDTO {
    _id: string;
    name: string;
    email: string;
  
    constructor(user: any) {
      this._id = user._id?.toString() || user.id || user.toString();
      this.name = user.name || 'Unknown';
      this.email = user.email || '';
    }
  }