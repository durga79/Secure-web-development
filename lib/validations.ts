import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['STUDENT', 'ADMIN']).optional(),
});

export const courseSchema = z.object({
  code: z.string().min(2).max(20),
  name: z.string().min(3).max(200),
  description: z.string().optional(),
});

export const assignmentSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  fileUrl: z.string().optional().or(z.literal('')), // Allow both URLs and local paths
  fileName: z.string().optional(),
});

export const submissionSchema = z.object({
  assignmentId: z.string().uuid(),
  content: z.string().optional().or(z.literal('')),
  fileUrl: z.string().optional().or(z.literal('')),
  fileName: z.string().optional().or(z.literal('')),
});

export const gradeSubmissionSchema = z.object({
  grade: z.number().min(0).max(100),
  feedback: z.string().optional(),
});

export const enrollmentSchema = z.object({
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['STUDENT', 'ADMIN']).optional(),
});

