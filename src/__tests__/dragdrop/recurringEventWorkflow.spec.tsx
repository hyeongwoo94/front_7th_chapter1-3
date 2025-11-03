import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
  setupMockHandlerListCreation,
  setupMockHandlerRecurringListDelete,
  setupMockHandlerRecurringListUpdate,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils';
import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

const theme = createTheme();

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

const saveRecurringSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'> & {
    repeat: { type: 'daily' | 'weekly' | 'monthly' | 'yearly'; interval: number; endDate?: string };
  }
) => {
  const { title, date, startTime, endTime, location, description, category, repeat } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  await user.click(screen.getByLabelText('반복 일정'));
  await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${repeat.type}-option` }));
  await user.clear(screen.getByLabelText('반복 간격'));
  await user.type(screen.getByLabelText('반복 간격'), String(repeat.interval));
  if (repeat.endDate) {
    await user.type(screen.getByLabelText('반복 종료일'), repeat.endDate);
  }

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 일정 관리 워크플로우 전반 (CRUD)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-10-15T12:00:00'));
  });

  afterEach(() => {
    server.resetHandlers();
    vi.useRealTimers();
  });

  describe('Create (생성)', () => {
    it('일일 반복 일정을 생성할 수 있다', async () => {
      setupMockHandlerListCreation();
      const { user } = setup(<App />);

      await saveRecurringSchedule(user, {
        title: '매일 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
      });

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        const events = eventList.getAllByText('매일 회의');
        expect(events.length).toBeGreaterThan(0);
      });
    });

    it('주간 반복 일정을 생성할 수 있다', async () => {
      setupMockHandlerListCreation();
      const { user } = setup(<App />);

      await saveRecurringSchedule(user, {
        title: '주간 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '매주 진행되는 회의',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-11-15' },
      });

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('주간 회의')).toBeInTheDocument();
      });
    });

    it('월간 반복 일정을 생성할 수 있다', async () => {
      setupMockHandlerListCreation();
      const { user } = setup(<App />);

      await saveRecurringSchedule(user, {
        title: '월간 회의',
        date: '2025-10-15',
        startTime: '15:00',
        endTime: '16:00',
        description: '매월 진행되는 회의',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2026-01-15' },
      });

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('월간 회의')).toBeInTheDocument();
      });
    });

    it('간격이 있는 반복 일정을 생성할 수 있다', async () => {
      setupMockHandlerListCreation();
      const { user } = setup(<App />);

      await saveRecurringSchedule(user, {
        title: '격일 회의',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '격일 진행되는 회의',
        location: '회의실 D',
        category: '업무',
        repeat: { type: 'daily', interval: 2, endDate: '2025-10-19' },
      });

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        const events = eventList.getAllByText('격일 회의');
        expect(events.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Read (조회)', () => {
    it('반복 일정 목록을 조회할 수 있다', async () => {
      setupMockHandlerUpdating([
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
          notificationTime: 10,
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
          notificationTime: 10,
        },
      ]);

      setup(<App />);

      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        const events = eventList.getAllByText('매일 회의');
        expect(events.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('반복 일정이 캘린더 뷰에 표시된다', async () => {
      setupMockHandlerListCreation();
      const { user } = setup(<App />);

      await saveRecurringSchedule(user, {
        title: '반복 표시 테스트',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '설명',
        location: '위치',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
      });

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const monthView = within(screen.getByTestId('month-view'));
      await waitFor(() => {
        const events = monthView.getAllByText('반복 표시 테스트');
        expect(events.length).toBeGreaterThan(0);
      });
    });

    it('반복 일정의 반복 정보를 조회할 수 있다', async () => {
      setupMockHandlerUpdating([
        {
          id: '1',
          title: '2일마다 회의',
          date: '2025-10-15',
          startTime: '14:00',
          endTime: '15:00',
          description: '2일마다 진행',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'daily', interval: 2, endDate: '2025-10-19' },
          notificationTime: 10,
        },
      ]);

      setup(<App />);

      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.getByText('반복: 2일마다 (종료: 2025-10-19)')).toBeInTheDocument();
      });
    });
  });

  describe('Update (수정)', () => {
    it('반복 일정 수정 다이얼로그가 나타난다', async () => {
      setupMockHandlerUpdating([
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
          notificationTime: 10,
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
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);
      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
        expect(screen.getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
      });
    });

    it('단일 일정만 수정할 수 있다 (예 선택)', async () => {
      setupMockHandlerRecurringListUpdate([
        {
          id: '1',
          title: '매일 회의',
          date: '2025-10-15',
          startTime: '14:00',
          endTime: '15:00',
          description: '매일 진행되는 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { id: 'repeat-1', type: 'daily', interval: 1, endDate: '2025-10-16' },
          notificationTime: 10,
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
          repeat: { id: 'repeat-1', type: 'daily', interval: 1, endDate: '2025-10-16' },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);
      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
      });

      await user.click(screen.getByText('예'));

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 단일 일정');

      await user.click(screen.getByTestId('event-submit-button'));

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('수정된 단일 일정')).toBeInTheDocument();
      });
    });

    it('전체 시리즈를 수정할 수 있다 (아니오 선택)', async () => {
      setupMockHandlerRecurringListUpdate([
        {
          id: '1',
          title: '매일 회의',
          date: '2025-10-15',
          startTime: '14:00',
          endTime: '15:00',
          description: '매일 진행되는 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { id: 'repeat-1', type: 'daily', interval: 1, endDate: '2025-10-16' },
          notificationTime: 10,
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
          repeat: { id: 'repeat-1', type: 'daily', interval: 1, endDate: '2025-10-16' },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);
      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
      });

      await user.click(screen.getByText('아니오'));

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '전체 수정된 회의');

      await user.click(screen.getByTestId('event-submit-button'));

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        const events = eventList.getAllByText('전체 수정된 회의');
        expect(events.length).toBeGreaterThan(1);
      });
    });
  });

  describe('Delete (삭제)', () => {
    it('반복 일정 삭제 다이얼로그가 나타난다', async () => {
      setupMockHandlerUpdating([
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
          notificationTime: 10,
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
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);
      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      await waitFor(
        () => {
          expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
          expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('단일 일정만 삭제할 수 있다 (예 선택)', async () => {
      setupMockHandlerRecurringListDelete([
        {
          id: '1',
          title: '매일 회의',
          date: '2025-10-15',
          startTime: '14:00',
          endTime: '15:00',
          description: '매일 진행되는 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { id: 'repeat-1', type: 'daily', interval: 1, endDate: '2025-10-16' },
          notificationTime: 10,
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
          repeat: { id: 'repeat-1', type: 'daily', interval: 1, endDate: '2025-10-16' },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);
      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      await waitFor(
        () => {
          expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      await user.click(screen.getByText('예'));

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        const events = eventList.queryAllByText('매일 회의');
        expect(events.length).toBe(1);
      });
    });

    it('전체 시리즈를 삭제할 수 있다 (아니오 선택)', async () => {
      setupMockHandlerRecurringListDelete([
        {
          id: '1',
          title: '매일 회의',
          date: '2025-10-15',
          startTime: '14:00',
          endTime: '15:00',
          description: '매일 진행되는 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { id: 'repeat-1', type: 'daily', interval: 1, endDate: '2025-10-16' },
          notificationTime: 10,
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
          repeat: { id: 'repeat-1', type: 'daily', interval: 1, endDate: '2025-10-16' },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);
      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      await waitFor(
        () => {
          expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      await user.click(screen.getByText('아니오'));

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.queryByText('매일 회의')).not.toBeInTheDocument();
      });
    });
  });

  describe('CRUD 통합 시나리오', () => {
    it('반복 일정을 생성하고 조회하고 수정하고 삭제하는 전체 워크플로우가 작동한다', async () => {
      setupMockHandlerRecurringListUpdate();
      const { user } = setup(<App />);

      // Create
      await saveRecurringSchedule(user, {
        title: '통합 반복 테스트',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '초기 설명',
        location: '초기 위치',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
      });

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        const events = eventList.getAllByText('통합 반복 테스트');
        expect(events.length).toBeGreaterThan(0);
      });

      // Read & Update (단일 수정)
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
      });

      await user.click(screen.getByText('예'));

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 통합 반복 테스트');

      await user.click(screen.getByTestId('event-submit-button'));

      // 수정이 완료되고 이벤트 리스트가 업데이트될 때까지 대기
      // <!-- 수정이 완료되고 이벤트 리스트가 업데이트될 때까지 대기 -->
      await waitFor(
        () => {
          expect(eventList.getByText('수정된 통합 반복 테스트')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Delete
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      await waitFor(
        () => {
          expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      await user.click(screen.getByText('예'));

      await waitFor(() => {
        expect(eventList.queryByText('수정된 통합 반복 테스트')).not.toBeInTheDocument();
      });
    });
  });
});
