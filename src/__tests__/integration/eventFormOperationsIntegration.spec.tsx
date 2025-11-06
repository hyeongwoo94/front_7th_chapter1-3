import { act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  setupBeforeEach,
  setupEventForm,
  setupEventOperations,
  setupSaveEventMocks,
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
 * 통합 테스트: useEventForm ↔ useEventOperations 연동
 * 목적: editEvent 호출 시 editingEvent 상태가 설정되고, 이것이 useEventOperations의 editing 파라미터와 onSave 콜백에 영향을 주는지 확인
 */
describe('통합 테스트: useEventForm ↔ useEventOperations 연동', () => {
  beforeEach(() => {
    setupBeforeEach();
  });

  const mockEvent: Event = {
    id: '1',
    title: '테스트 일정',
    date: '2025-10-15',
    startTime: '14:00',
    endTime: '15:00',
    description: '테스트 설명',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('editEvent 호출 시 editingEvent 상태가 설정되고, 이것이 useEventOperations의 editing 파라미터에 영향을 준다', async () => {
    // useEventForm 초기화
    const { result: eventFormResult } = setupEventForm();

    // useEventOperations 초기화 (editing 파라미터는 editingEvent 상태에 의존)
    const mockOnSave = vi.fn();
    const { result: eventOperationsResult, rerender: rerenderOperations } =
      await setupEventOperations([], Boolean(eventFormResult.current.editingEvent), mockOnSave);

    // editEvent 호출
    act(() => {
      eventFormResult.current.editEvent(mockEvent);
    });

    // editingEvent 상태가 설정되었는지 확인
    expect(eventFormResult.current.editingEvent).toEqual(mockEvent);
    expect(eventFormResult.current.title).toBe(mockEvent.title);
    expect(eventFormResult.current.date).toBe(mockEvent.date);

    // useEventOperations의 editing 파라미터가 업데이트되었는지 확인 (rerender로 반영)
    rerenderOperations({
      editing: Boolean(eventFormResult.current.editingEvent),
      onSave: mockOnSave,
    });

    // saveEvent 호출을 위한 mock 설정
    setupSaveEventMocks([]);

    await act(async () => {
      await eventOperationsResult.current.saveEvent({
        ...mockEvent,
        title: '수정된 제목',
      });
    });

    // 업데이트 모드로 PUT 요청이 전송되었는지 확인
    expect(global.fetch).toHaveBeenCalledWith(`/api/events/${mockEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('수정된 제목'),
    });
  });

  it('saveEvent 호출 시 onSave 콜백이 호출되어 editingEvent가 초기화된다', async () => {
    // useEventForm 초기화
    const { result: eventFormResult } = setupEventForm();

    // editEvent로 편집 모드 진입
    act(() => {
      eventFormResult.current.editEvent(mockEvent);
    });

    expect(eventFormResult.current.editingEvent).toEqual(mockEvent);

    // useEventOperations 초기화 (onSave 콜백으로 setEditingEvent(null) 전달)
    const { result: eventOperationsResult } = await setupEventOperations(
      [],
      Boolean(eventFormResult.current.editingEvent),
      () => {
        eventFormResult.current.setEditingEvent(null);
      }
    );

    // saveEvent 호출을 위한 mock 설정
    setupSaveEventMocks([]);

    await act(async () => {
      await eventOperationsResult.current.saveEvent({
        ...mockEvent,
        title: '수정된 제목',
      });
    });

    // onSave 콜백이 호출되어 editingEvent가 초기화되었는지 확인
    expect(eventFormResult.current.editingEvent).toBeNull();
  });

  it('resetForm 호출 시 모든 폼 상태가 초기화된다 (editingEvent는 별도로 초기화해야 함)', () => {
    const { result: eventFormResult } = setupEventForm();

    // editEvent로 편집 모드 진입
    act(() => {
      eventFormResult.current.editEvent(mockEvent);
    });

    // 폼 필드가 채워졌는지 확인
    expect(eventFormResult.current.title).toBe(mockEvent.title);
    expect(eventFormResult.current.editingEvent).toEqual(mockEvent);

    // resetForm 호출 (editingEvent는 resetForm에서 초기화하지 않음)
    act(() => {
      eventFormResult.current.resetForm();
    });

    // 모든 폼 상태가 초기화되었는지 확인
    expect(eventFormResult.current.title).toBe('');
    expect(eventFormResult.current.date).toBe('');
    expect(eventFormResult.current.startTime).toBe('');
    // resetForm은 editingEvent를 초기화하지 않으므로, 별도로 setEditingEvent(null)을 호출해야 함
    expect(eventFormResult.current.editingEvent).toEqual(mockEvent);
  });
});
