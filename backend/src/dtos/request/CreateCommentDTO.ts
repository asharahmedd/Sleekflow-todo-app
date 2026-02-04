export class CreateCommentDTO {
    content: string;
  
    constructor(body: any) {
      // Validate content
      if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
        throw new Error('Comment content is required and must be a non-empty string');
      }
  
      if (body.content.trim().length > 1000) {
        throw new Error('Comment content must be less than 1000 characters');
      }
  
      // Assign validated value
      this.content = body.content.trim();
    }
  }