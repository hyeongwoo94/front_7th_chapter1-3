import { act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  setupBeforeEach,
  setupEventOperations,
  setupSearch,
  setupSaveEventMocks,
  setupDeleteEventMocks,
} from './__helpers__/integrationTestUtils';
import { Event } from '../../types';

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: vi.fn(),
    }),
  };
});

/**
 * 통합 테스트: useEventOperations ↔ useSearch 연동
 * 목적: useEventOperations의 events 상태 변경이 useSearch의 filteredEvents에 즉시 반영되는지 확인
 */
describe('통합 테스트: useEventOperations ↔ useSearch 연동', () => {
  beforeEach(() => {
    setupBeforeEach();
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
    const { result: eventOperationsResult } = await setupEventOperations(mockEvents);

    // useSearch 초기화 (useEventOperations의 events를 사용)
    const currentDate = new Date('2025-10-01');
    const { result: searchResult, rerender: rerenderSearch } = setupSearch(
      eventOperationsResult.current.events,
      currentDate,
      'month'
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

    // saveEvent 호출을 위한 mock 설정
    setupSaveEventMocks([...mockEvents, newEvent]);

    await act(async () => {
      await eventOperationsResult.current.saveEvent(newEvent);
    });

    // useSearch의 filteredEvents가 업데이트되었는지 확인 (연동 확인)
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
    const { result: eventOperationsResult } = await setupEventOperations(mockEvents);

    // useSearch 초기화
    const currentDate = new Date('2025-10-01');
    const { result: searchResult, rerender: rerenderSearch } = setupSearch(
      eventOperationsResult.current.events,
      currentDate,
      'month'
    );

    expect(searchResult.current.filteredEvents).toHaveLength(2);

    // 이벤트 삭제를 위한 mock 설정
    setupDeleteEventMocks([mockEvents[1]]);

    await act(async () => {
      await eventOperationsResult.current.deleteEvent('1');
    });

    // useSearch의 filteredEvents가 업데이트되었는지 확인 (연동 확인)
    rerenderSearch({
      events: eventOperationsResult.current.events,
      currentDate,
      view: 'month' as const,
    });

    expect(searchResult.current.filteredEvents).toHaveLength(1);
    expect(searchResult.current.filteredEvents[0].id).toBe('2');
  });
});
