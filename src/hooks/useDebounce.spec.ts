import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';
import { describe, it, expect, vi } from 'vitest';

describe('useDebounce', () => {
  vi.useFakeTimers();

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce the value change', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    // Update the value
    rerender({ value: 'updated', delay: 500 });

    // Should still be initial immediately after update
    expect(result.current).toBe('initial');

    // Advance time by 250ms (less than delay)
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('initial');

    // Advance time by another 250ms (total 500ms)
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('updated');
  });

  it('should reset the timer if the value changes before the delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    // Update the value
    rerender({ value: 'first update', delay: 500 });

    // Advance time by 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // Update the value again before the first timer finishes
    rerender({ value: 'second update', delay: 500 });

    // Advance time by 300ms (total 600ms since first update, but only 300ms since second)
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // Advance time by another 200ms (total 500ms since second update)
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('second update');
  });
});
