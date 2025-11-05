import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useEventOperations } from '../../hooks/useEventOperations';
import { useSearch } from '../../hooks/useSearch';
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
 * 통합 테스트: useEventOperations ↔ useSearch 연동
 * 목적: useEventOperations의 events 상태 변경이 useSearch의 filteredEvents에 즉시 반영되는지 확인
 */
describe('통합 테스트: useEventOperations ↔ useSearch 연동', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  const mockEvents: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-10-16',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심',
      location: '레스토랑',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('useEventOperations의 events가 변경되면 useSearch의 filteredEvents가 즉시 반영된다', async () => {
    // useEventOperations 초기화
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: mockEvents }),
    });

    const { result: eventOperationsResult } = renderHook(() => useEventOperations(false));

    // 초기 events 로딩 대기
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // useSearch 초기화 (useEventOperations의 events를 사용)
    const currentDate = new Date('2025-10-01');
    const { result: searchResult, rerender: rerenderSearch } = renderHook(
      ({ events, currentDate, view }) => useSearch(events, currentDate, view),
      {
        initialProps: {
          events: eventOperationsResult.current.events,
          currentDate,
          view: 'month' as const,
        },
      }
    );

    // 초기 filteredEvents 확인
    expect(searchResult.current.filteredEvents).toHaveLength(2);
    expect(searchResult.current.filteredEvents[0].title).toBe('회의');

    // 새로운 이벤트 추가
    const newEvent: Event = {
      id: '3',
      title: '새 일정',
      date: '2025-10-17',
      startTime: '14:00',
      endTime: '15:00',
      description: '새로운 일정',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    // saveEvent 호출 (POST 요청)
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: [] }),
    });
    // saveEvent 호출 후 fetchEvents가 호출되므로 추가 mock 필요
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: [...mockEvents, newEvent] }),
    });

    await act(async () => {
      await eventOperationsResult.current.saveEvent(newEvent);
    });

    // useSearch의 filteredEvents가 업데이트되었는지 확인 (연동 확인)
    // useSearch는 events를 파라미터로 받으므로, 같은 hook을 rerender하여 업데이트 확인
    rerenderSearch({
      events: eventOperationsResult.current.events,
      currentDate,
      view: 'month' as const,
    });

    expect(searchResult.current.filteredEvents).toHaveLength(3);
    expect(searchResult.current.filteredEvents[2].title).toBe('새 일정');
  });

  it('useEventOperations의 events 삭제 시 useSearch의 filteredEvents에서도 제거된다', async () => {
    // useEventOperations 초기화
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: mockEvents }),
    });

    const { result: eventOperationsResult } = renderHook(() => useEventOperations(false));

    // 초기 events 로딩 대기
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // useSearch 초기화
    const currentDate = new Date('2025-10-01');
    const { result: searchResult, rerender: rerenderSearch } = renderHook(
      ({ events, currentDate, view }) => useSearch(events, currentDate, view),
      {
        initialProps: {
          events: eventOperationsResult.current.events,
          currentDate,
          view: 'month' as const,
        },
      }
    );

    expect(searchResult.current.filteredEvents).toHaveLength(2);

    // 이벤트 삭제 (DELETE 요청)
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: [] }),
    });
    // deleteEvent 호출 후 fetchEvents가 호출되므로 추가 mock 필요
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ events: [mockEvents[1]] }),
    });

    await act(async () => {
      await eventOperationsResult.current.deleteEvent('1');
    });

    // useSearch의 filteredEvents가 업데이트되었는지 확인 (연동 확인)
    // useSearch는 events를 파라미터로 받으므로, 같은 hook을 rerender하여 업데이트 확인
    rerenderSearch({
      events: eventOperationsResult.current.events,
      currentDate,
      view: 'month' as const,
    });

    expect(searchResult.current.filteredEvents).toHaveLength(1);
    expect(searchResult.current.filteredEvents[0].id).toBe('2');
  });
});
