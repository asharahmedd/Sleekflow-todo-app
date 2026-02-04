import { Request, Response } from 'express';
import jwt  from 'jsonwebtoken';
import User from '../models/User';
import { broadcastActivity } from '../services/socketService';
import { RegisterUserDTO } from '../dtos/request/RegisterUserDTO';
import { LoginUserDTO } from '../dtos/request/LoginUserDTO';
import { UserResponseDTO } from '../dtos/response/UserResponseDTO';
import { ErrorResponseDTO } from '../dtos/response/ErrorResponseDTO';


// Generate JWT Token
const generateToken = (id: string): string => {
    return jwt.sign(
      { id }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '7d' }
    );
  };

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input using DTO
    const registerDTO = new RegisterUserDTO(req.body);

    // Check if user already exists
    const userExists = await User.findOne({ email: registerDTO.email });

    if (userExists) {
      res.status(400).json(new ErrorResponseDTO('User already exists', 400));
      return;
    }

    // Create user
    const user = await User.create({
      name: registerDTO.name,
      email: registerDTO.email,
      password: registerDTO.password,
    });

    if (user) {
      // Generate token
      const token = generateToken(user._id.toString());
      
      // Return formatted response using DTO
      const userResponse = new UserResponseDTO(user);
      res.status(201).json({
        ...userResponse,
        token,
      });
      
      await broadcastActivity(
        'user_registered',
        user._id.toString(),
        user.name,
        `${user.name} joined the platform`
      );
    } else {
      res.status(400).json(new ErrorResponseDTO('Invalid user data', 400));
    }
  } catch (error: any) {
    // Handle DTO validation errors
    if (error.message && (error.message.includes('required') || error.message.includes('Invalid'))) {
      res.status(400).json(new ErrorResponseDTO(error.message, 400));
    } else if (error.name === 'ValidationError') {
      res.status(400).json(new ErrorResponseDTO('Validation failed', 400));
    } else {
      res.status(500).json(new ErrorResponseDTO('Error creating user', 500));
    }
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input using DTO
    const loginDTO = new LoginUserDTO(req.body);

    // Check for user email
    const user = await User.findOne({ email: loginDTO.email }).select('+password');

    if (!user) {
      res.status(401).json(new ErrorResponseDTO('Invalid credentials', 401));
      return;
    }

    // Check if password matches
    const isMatch = await user.comparePassword(loginDTO.password);

    if (!isMatch) {
      res.status(401).json(new ErrorResponseDTO('Invalid credentials', 401));
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString());
    
    // Return formatted response using DTO
    const userResponse = new UserResponseDTO(user);
    res.status(200).json({
      ...userResponse,
      token,
    });
    
    try {
      await broadcastActivity(
        'user_logged_in',
        user._id.toString(),
        user.name,
        `${user.name} logged in`
      );
    } catch (error) {
      console.error('Error broadcasting activity:', error);
    }
  } catch (error: any) {
    // Handle DTO validation errors
    if (error.message && (error.message.includes('required') || error.message.includes('Invalid'))) {
      res.status(400).json(new ErrorResponseDTO(error.message, 400));
    } else {
      res.status(500).json(new ErrorResponseDTO('Error logging in', 500));
    }
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json(new ErrorResponseDTO('User not found', 404));
      return;
    }

    // Return formatted response using DTO
    const userResponse = new UserResponseDTO(user);
    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json(new ErrorResponseDTO('Error fetching user', 500));
  }
};

// @desc    Search users by name or email
// @route   GET /api/auth/users/search?q=query
// @access  Private
export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      res.status(400).json(new ErrorResponseDTO('Search query required', 400));
      return;
    }
    
    // Search users by name or email (case-insensitive)
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user?.id }  // Exclude current user from results
    })
    .select('name email')  // Only return name and email
    .limit(10);  // Limit to 10 results
    
    // Return formatted response using DTO
    const userResponses = users.map(user => new UserResponseDTO(user));
    res.status(200).json(userResponses);
  } catch (error) {
    res.status(500).json(new ErrorResponseDTO('Error searching users', 500));
  }
};