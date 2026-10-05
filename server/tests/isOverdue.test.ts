import { describe, expect, it } from 'vitest';
import { isOverdue } from '../src/modules/loans/loans.rules.js';

describe('isOverdue', () => {
  const today = '2026-10-05';

  it('is false when the due date is today', () => {
    expect(isOverdue({ dueDate: '2026-10-05', returnedAt: null }, today)).toBe(false);
  });

  it('is true when the due date has passed and the item is not returned', () => {
    expect(isOverdue({ dueDate: '2026-10-04', returnedAt: null }, today)).toBe(true);
  });

  it('is false for a returned loan even if it was late', () => {
    expect(
      isOverdue({ dueDate: '2026-10-01', returnedAt: '2026-10-03T10:00:00.000Z' }, today),
    ).toBe(false);
  });
});
