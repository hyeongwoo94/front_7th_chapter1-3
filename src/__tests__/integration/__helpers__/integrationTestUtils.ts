import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useEventForm } from '../../../hooks/useEventForm';
import { useEventOperations } from '../../../hooks/useEventOperations';
import { useNotifications } from '../../../hooks/useNotifications';
import { useRecurringEventOperations } from '../../../hooks/useRecurringEventOperations';
import { useSearch } from '../../../hooks/useSearch';
import { Event } from '../../../types';

// notistack mock은 각 테스트 파일에서 직접 설정해야 함
// notistack mock must be set up directly in each test file

/**
 * beforeEach 공통 설정
 * Common beforeEach setup
 */
export const setupBeforeEach = () => {
  vi.clearAllMocks();
  global.fetch = vi.fn();
};

/**
 * Fetch mock 헬퍼 함수
 * Fetch mock helper functions
 */
export const mockFetchSuccess = (responseData: { events?: Event[]; [key: string]: unknown }) => {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: true,
    json: async () => responseData,
  });
};

export const mockFetchError = (status: number = 500) => {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ error: 'Error' }),
  });
};

/**
 * 초기 로딩 대기 헬퍼
 * Initial loading wait helper
 */
export const waitForInitialLoad = async (delay: number = 100) => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, delay));
  });
};

/**
 * useEventOperations 초기화 헬퍼
 * useEventOperations initialization helper
 */
export const setupEventOperations = async (
  initialEvents: Event[] = [],
  editing: boolean = false,
  onSave?: () => void
) => {
  mockFetchSuccess({ events: initialEvents });

  const { result, rerender } = renderHook(
    ({ editing, onSave }) => useEventOperations(editing, onSave),
    {
      initialProps: { editing, onSave },
    }
  );

  await waitForInitialLoad();

  return { result, rerender };
};

/**
 * useEventForm 초기화 헬퍼
 * useEventForm initialization helper
 */
export const setupEventForm = () => {
  const { result } = renderHook(() => useEventForm());
  return { result };
};

/**
 * useSearch 초기화 헬퍼
 * useSearch initialization helper
 */
export const setupSearch = (
  events: Event[],
  currentDate: Date = new Date('2025-10-01'),
  view: 'week' | 'month' = 'month'
) => {
  const { result, rerender } = renderHook(
    ({ events, currentDate, view }) => useSearch(events, currentDate, view),
    {
      initialProps: { events, currentDate, view },
    }
  );

  return { result, rerender };
};

/**
 * useNotifications 초기화 헬퍼
 * useNotifications initialization helper
 */
export const setupNotifications = (events: Event[]) => {
  const { result } = renderHook(() => useNotifications(events));
  return { result };
};

/**
 * useRecurringEventOperations 초기화 헬퍼
 * useRecurringEventOperations initialization helper
 */
export const setupRecurringEventOperations = (
  events: Event[],
  updateEvents: () => Promise<void> = async () => {}
) => {
  const { result } = renderHook(() => useRecurringEventOperations(events, updateEvents));
  return { result };
};

/**
 * saveEvent 호출 시 필요한 fetch mock 설정
 * Setup fetch mocks for saveEvent call
 */
export const setupSaveEventMocks = (updatedEvents: Event[] = []) => {
  // POST/PUT 요청 mock
  mockFetchSuccess({ events: [] });
  // fetchEvents 호출 mock
  mockFetchSuccess({ events: updatedEvents });
};

/**
 * deleteEvent 호출 시 필요한 fetch mock 설정
 * Setup fetch mocks for deleteEvent call
 */
export const setupDeleteEventMocks = (remainingEvents: Event[] = []) => {
  // DELETE 요청 mock
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });
  // fetchEvents 호출 mock
  mockFetchSuccess({ events: remainingEvents });
};

/**
 * handleRecurringEdit 호출 시 필요한 fetch mock 설정
 * Setup fetch mocks for handleRecurringEdit call
 */
export const setupRecurringEditMocks = (updatedEvents: Event[] = []) => {
  // PUT 요청 mock
  mockFetchSuccess({ events: [] });
  // updateEvents 콜백에서 fetchEvents 호출 mock
  mockFetchSuccess({ events: updatedEvents });
};

/**
 * handleRecurringDelete 호출 시 필요한 fetch mock 설정
 * Setup fetch mocks for handleRecurringDelete call
 */
export const setupRecurringDeleteMocks = (remainingEvents: Event[] = []) => {
  // DELETE 요청 mock
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });
  // updateEvents 콜백에서 fetchEvents 호출 mock
  mockFetchSuccess({ events: remainingEvents });
};
