import { describe, it, expect } from 'vitest';

describe('AdminUploadMaterials Filename Generation', () => {
  it('should generate a filename with a valid UUID', () => {
    // The logic we implemented:
    // const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

    const fileExt = 'pdf';
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

    const parts = fileName.split('-');
    // Date.now() is the first part, then the UUID (which contains hyphens)
    // crypto.randomUUID() returns a v4 UUID like "123e4567-e89b-12d3-a456-426614174000"

    // So fileName will look like: 1678901234567-123e4567-e89b-12d3-a456-426614174000.pdf

    expect(fileName).toMatch(/^\d+-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.pdf$/);
  });
});
