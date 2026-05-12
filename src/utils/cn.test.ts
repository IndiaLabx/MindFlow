import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility function', () => {
  it('should join multiple class names with a space', () => {
    expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
  });

  it('should filter out undefined values', () => {
    expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
  });

  it('should filter out null values', () => {
    expect(cn('class1', null, 'class2')).toBe('class1 class2');
  });

  it('should filter out false values', () => {
    expect(cn('class1', false, 'class2')).toBe('class1 class2');
  });

  it('should filter out empty strings', () => {
    // Note: empty string is falsy and will be filtered by Boolean
    expect(cn('class1', '', 'class2')).toBe('class1 class2');
  });

  it('should handle a mix of truthy and falsy values', () => {
    expect(cn('class1', null, 'class2', undefined, false, 'class3', '')).toBe('class1 class2 class3');
  });

  it('should return an empty string when no arguments are provided', () => {
    expect(cn()).toBe('');
  });

  it('should return an empty string when all arguments are falsy', () => {
    expect(cn(null, undefined, false, '')).toBe('');
  });

  it('should handle a single class name', () => {
    expect(cn('class1')).toBe('class1');
  });
});
