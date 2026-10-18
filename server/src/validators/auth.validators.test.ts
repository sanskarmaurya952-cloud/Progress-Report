import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from './auth.validators';

describe('Auth Validators', () => {
  it('validates a correct registration payload', () => {
    const validData = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      collegeName: 'National Institute of Technology',
      course: 'B.Tech Computer Science',
      academicYear: '3rd Year',
      linkedinUrl: 'https://www.linkedin.com/in/johndoe',
      leetcodeUrl: 'https://leetcode.com/u/johndoe',
      password: 'SecurePassword123',
      confirmPassword: 'SecurePassword123',
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects passwords without numbers or uppercase letters', () => {
    const invalidData = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      collegeName: 'National Institute of Technology',
      course: 'B.Tech Computer Science',
      academicYear: '3rd Year',
      linkedinUrl: 'https://www.linkedin.com/in/johndoe',
      leetcodeUrl: 'https://leetcode.com/u/johndoe',
      password: 'passwordonly',
      confirmPassword: 'passwordonly',
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects non-matching password confirmation', () => {
    const invalidData = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      collegeName: 'National Institute of Technology',
      course: 'B.Tech Computer Science',
      academicYear: '3rd Year',
      linkedinUrl: 'https://www.linkedin.com/in/johndoe',
      leetcodeUrl: 'https://leetcode.com/u/johndoe',
      password: 'SecurePassword123',
      confirmPassword: 'DifferentPassword123',
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects URLs that do not match LinkedIn or LeetCode domains', () => {
    const invalidData = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      collegeName: 'National Institute of Technology',
      course: 'B.Tech Computer Science',
      academicYear: '3rd Year',
      linkedinUrl: 'https://github.com/johndoe',
      leetcodeUrl: 'https://hackerrank.com/johndoe',
      password: 'SecurePassword123',
      confirmPassword: 'SecurePassword123',
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('validates a correct login payload', () => {
    const result = loginSchema.safeParse({
      email: 'student@college.edu',
      password: 'Password123',
    });
    expect(result.success).toBe(true);
  });
});
