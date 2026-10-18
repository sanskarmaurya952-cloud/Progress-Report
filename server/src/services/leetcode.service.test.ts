import { describe, it, expect } from 'vitest';
import { extractLeetcodeUsername } from './leetcode.service';

describe('LeetCode Service - Username Extraction', () => {
  it('extracts username from standard profile URL', () => {
    expect(extractLeetcodeUsername('https://leetcode.com/sanskardev')).toBe('sanskardev');
    expect(extractLeetcodeUsername('https://leetcode.com/sanskardev/')).toBe('sanskardev');
  });

  it('extracts username from /u/ profile URL format', () => {
    expect(extractLeetcodeUsername('https://leetcode.com/u/sanskardev')).toBe('sanskardev');
    expect(extractLeetcodeUsername('https://leetcode.com/u/sanskardev/')).toBe('sanskardev');
  });

  it('handles query parameters and hashes', () => {
    expect(extractLeetcodeUsername('https://leetcode.com/u/sanskardev?tab=submissions#overview')).toBe('sanskardev');
  });

  it('handles bare usernames directly', () => {
    expect(extractLeetcodeUsername('sanskardev')).toBe('sanskardev');
    expect(extractLeetcodeUsername('john_doe-123')).toBe('john_doe-123');
  });

  it('returns empty string on empty input', () => {
    expect(extractLeetcodeUsername('')).toBe('');
  });
});
