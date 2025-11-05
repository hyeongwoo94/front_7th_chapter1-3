import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useEventOperations } from '../../hooks/useEventOperations';
import { useRecurringEventOperations } from '../../hooks/useRecurringEventOperations';
import { Event } from '../../types';

const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

/**
 * 통합 테스트: useRecurringEventOperations ↔ useEventOperations 연동
 * 목적: 반복 일정 편집/삭제 시 useEventOperations의 fetchEvents가 호출되어 events 상태가 업데이트되는지 확인
 */
describe('통합 테스트: useRecurringEventOperations ↔ useEventOperations 연동', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  const mockRecurringEvents: Event[] = [
    {
      id: '1',
      title: '매일 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '매일 진행되는 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
      notificationTime: 1,
    },
    {
      id: '2',
      title: '매일 회의',
      date: '2025-10-16',
      startTime: '14:00',
      endTime: '15:00',
      description: '매일 진행되는 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
      notificationTime: 1,
    },
  ];

  it('handleRecurringEdit 호출 시 updateEvents 콜백으로 fetchEvents가 호출되어 events가 갱신된다', async () => {
    // useEventOperations 초기화
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: mockRecurringEvents }),
    });

    const { result: eventOperationsResult } = renderHook(() => useEventOperations(false));

    // 초기 events 로딩 대기
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // useRecurringEventOperations 초기화 (updateEvents 콜백으로 fetchEvents 전달)
    const mockUpdateEvents = vi.fn();
    const { result: recurringOperationsResult } = renderHook(() =>
      useRecurringEventOperations(eventOperationsResult.current.events, async () => {
        await eventOperationsResult.current.fetchEvents();
        mockUpdateEvents([]);
      })
    );

    // handleRecurringEdit 호출 (단일 수정)
    // PUT 요청 mock
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: [] }),
    });
    // handleRecurringEdit 호출 후 updateEvents 콜백에서 fetchEvents가 호출되므로 추가 mock 필요
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: [] }),
    });

    const updatedEvent: Event = {
      ...mockRecurringEvents[0],
      title: '수정된 회의',
    };

    await act(async () => {
      await recurringOperationsResult.current.handleRecurringEdit(updatedEvent, true);
    });

    // fetchEvents가 호출되었는지 확인 (연동 확인)
    expect(global.fetch).toHaveBeenCalledWith('/api/events');
    expect(mockUpdateEvents).toHaveBeenCalledWith([]);
  });

  it('handleRecurringDelete 호출 시 updateEvents 콜백으로 fetchEvents가 호출되어 events가 갱신된다', async () => {
    // useEventOperations 초기화
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: mockRecurringEvents }),
    });

    const { result: eventOperationsResult } = renderHook(() => useEventOperations(false));

    // 초기 events 로딩 대기
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // useRecurringEventOperations 초기화 (updateEvents 콜백으로 fetchEvents 전달)
    const mockUpdateEvents = vi.fn();
    const { result: recurringOperationsResult } = renderHook(() =>
      useRecurringEventOperations(eventOperationsResult.current.events, async () => {
        await eventOperationsResult.current.fetchEvents();
        mockUpdateEvents([]);
      })
    );

    // handleRecurringDelete 호출 (단일 삭제)
    // DELETE 요청 mock
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });
    // handleRecurringDelete 호출 후 updateEvents 콜백에서 fetchEvents가 호출되므로 추가 mock 필요
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: [] }),
    });

    await act(async () => {
      await recurringOperationsResult.current.handleRecurringDelete(mockRecurringEvents[0], true);
    });

    // fetchEvents가 호출되었는지 확인 (연동 확인)
    expect(global.fetch).toHaveBeenCalledWith('/api/events');
    expect(mockUpdateEvents).toHaveBeenCalledWith([]);
  });

  it('findRelatedRecurringEvents가 events 배열을 기반으로 올바르게 관련 이벤트를 찾는다', async () => {
    // useEventOperations 초기화
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: mockRecurringEvents }),
    });

    const { result: eventOperationsResult } = renderHook(() => useEventOperations(false));

    // 초기 events 로딩 대기
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // useRecurringEventOperations 초기화
    const { result: recurringOperationsResult } = renderHook(() =>
      useRecurringEventOperations(eventOperationsResult.current.events, vi.fn())
    );

    // findRelatedRecurringEvents가 events 배열을 기반으로 올바르게 작동하는지 확인
    const relatedEvents = recurringOperationsResult.current.findRelatedRecurringEvents(
      mockRecurringEvents[0]
    );

    // 같은 반복 시리즈의 이벤트를 찾았는지 확인
    expect(relatedEvents).toHaveLength(2);
    expect(relatedEvents.map((e) => e.id)).toEqual(['1', '2']);
  });
});
