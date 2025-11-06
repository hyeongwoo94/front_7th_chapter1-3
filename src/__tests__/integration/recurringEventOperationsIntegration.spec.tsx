import { act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  setupBeforeEach,
  setupEventOperations,
  setupRecurringEventOperations,
  setupRecurringEditMocks,
  setupRecurringDeleteMocks,
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
 * 통합 테스트: useRecurringEventOperations ↔ useEventOperations 연동
 * 목적: 반복 일정 편집/삭제 시 useEventOperations의 fetchEvents가 호출되어 events 상태가 업데이트되는지 확인
 */
describe('통합 테스트: useRecurringEventOperations ↔ useEventOperations 연동', () => {
  beforeEach(() => {
    setupBeforeEach();
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
    const { result: eventOperationsResult } = await setupEventOperations(mockRecurringEvents);

    // useRecurringEventOperations 초기화 (updateEvents 콜백으로 fetchEvents 전달)
    const mockUpdateEvents = vi.fn();
    const { result: recurringOperationsResult } = setupRecurringEventOperations(
      eventOperationsResult.current.events,
      async () => {
        await eventOperationsResult.current.fetchEvents();
        mockUpdateEvents([]);
      }
    );

    // handleRecurringEdit 호출을 위한 mock 설정
    setupRecurringEditMocks([]);

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
    const { result: eventOperationsResult } = await setupEventOperations(mockRecurringEvents);

    // useRecurringEventOperations 초기화 (updateEvents 콜백으로 fetchEvents 전달)
    const mockUpdateEvents = vi.fn();
    const { result: recurringOperationsResult } = setupRecurringEventOperations(
      eventOperationsResult.current.events,
      async () => {
        await eventOperationsResult.current.fetchEvents();
        mockUpdateEvents([]);
      }
    );

    // handleRecurringDelete 호출을 위한 mock 설정
    setupRecurringDeleteMocks([]);

    await act(async () => {
      await recurringOperationsResult.current.handleRecurringDelete(mockRecurringEvents[0], true);
    });

    // fetchEvents가 호출되었는지 확인 (연동 확인)
    expect(global.fetch).toHaveBeenCalledWith('/api/events');
    expect(mockUpdateEvents).toHaveBeenCalledWith([]);
  });

  it('findRelatedRecurringEvents가 events 배열을 기반으로 올바르게 관련 이벤트를 찾는다', async () => {
    // useEventOperations 초기화
    const { result: eventOperationsResult } = await setupEventOperations(mockRecurringEvents);

    // useRecurringEventOperations 초기화
    const { result: recurringOperationsResult } = setupRecurringEventOperations(
      eventOperationsResult.current.events,
      vi.fn()
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
