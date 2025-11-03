import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
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

const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

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

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('일정 겹침 처리 방식 검증', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-15T12:00:00'));
  });

  afterEach(() => {
    server.resetHandlers();
    vi.useRealTimers();
  });

  describe('일정 생성 시 겹침 처리', () => {
    it('겹치는 시간에 새 일정을 추가할 때 경고 다이얼로그가 표시된다', async () => {
      setupMockHandlerCreation([
        {
          id: '1',
          title: '기존 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '새 회의',
        date: '2025-10-15',
        startTime: '09:30',
        endTime: '10:30',
        description: '설명',
        location: '회의실 A',
        category: '업무',
      });

      await waitFor(() => {
        expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
        expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
      });
    });

    it('겹치는 일정의 정보가 경고 다이얼로그에 표시된다', async () => {
      setupMockHandlerCreation([
        {
          id: '1',
          title: '기존 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '새 회의',
        date: '2025-10-15',
        startTime: '09:30',
        endTime: '10:30',
        description: '설명',
        location: '회의실 A',
        category: '업무',
      });

      await waitFor(() => {
        expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
      });
    });

    it('여러 일정과 겹칠 때 모든 겹치는 일정이 표시된다', async () => {
      setupMockHandlerCreation([
        {
          id: '1',
          title: '첫 번째 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '설명',
          location: '위치',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '두 번째 회의',
          date: '2025-10-15',
          startTime: '09:30',
          endTime: '10:30',
          description: '설명',
          location: '위치',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '겹치는 새 회의',
        date: '2025-10-15',
        startTime: '09:45',
        endTime: '10:45',
        description: '설명',
        location: '위치',
        category: '업무',
      });

      await waitFor(() => {
        expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
        expect(screen.getByText('첫 번째 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
        expect(screen.getByText('두 번째 회의 (2025-10-15 09:30-10:30)')).toBeInTheDocument();
      });
    });

    it('경고 다이얼로그에서 취소를 선택하면 일정이 생성되지 않는다', async () => {
      setupMockHandlerCreation([
        {
          id: '1',
          title: '기존 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '새 회의',
        date: '2025-10-15',
        startTime: '09:30',
        endTime: '10:30',
        description: '설명',
        location: '회의실 A',
        category: '업무',
      });

      await waitFor(() => {
        expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      });

      await user.click(screen.getByText('취소'));

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.queryByText('새 회의')).not.toBeInTheDocument();
      });
    });
  });

  describe('일정 수정 시 겹침 처리', () => {
    it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
      setupMockHandlerUpdating([
        {
          id: '1',
          title: '수정할 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '기존 회의',
          date: '2025-10-15',
          startTime: '08:00',
          endTime: '09:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      await user.clear(screen.getByLabelText('시작 시간'));
      await user.type(screen.getByLabelText('시작 시간'), '08:30');
      await user.clear(screen.getByLabelText('종료 시간'));
      await user.type(screen.getByLabelText('종료 시간'), '09:30');

      await user.click(screen.getByTestId('event-submit-button'));

      await waitFor(() => {
        expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
        expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
      });
    });

    it('자기 자신과의 겹침은 감지되지 않는다', async () => {
      setupMockHandlerUpdating([
        {
          id: '1',
          title: '수정할 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      await user.click(await screen.findByLabelText('Edit event'));

      await user.clear(screen.getByLabelText('시작 시간'));
      await user.type(screen.getByLabelText('시작 시간'), '09:30');
      await user.clear(screen.getByLabelText('종료 시간'));
      await user.type(screen.getByLabelText('종료 시간'), '10:30');

      await user.click(screen.getByTestId('event-submit-button'));

      await waitFor(() => {
        expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
      });
    });
  });

  describe('겹침이 없는 경우', () => {
    it('겹치지 않는 일정은 정상적으로 생성된다', async () => {
      setupMockHandlerCreation([
        {
          id: '1',
          title: '기존 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '새 회의',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '회의실 A',
        category: '업무',
      });

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('새 회의')).toBeInTheDocument();
        expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
      });
    });

    it('다른 날짜의 일정은 겹침으로 감지되지 않는다', async () => {
      setupMockHandlerCreation([
        {
          id: '1',
          title: '기존 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '새 회의',
        date: '2025-10-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '설명',
        location: '회의실 A',
        category: '업무',
      });

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('새 회의')).toBeInTheDocument();
        expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
      });
    });
  });

  describe('부분 겹침 처리', () => {
    it('시작 시간이 겹치는 경우 감지된다', async () => {
      setupMockHandlerCreation([
        {
          id: '1',
          title: '기존 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '새 회의',
        date: '2025-10-15',
        startTime: '09:30',
        endTime: '11:00',
        description: '설명',
        location: '회의실 A',
        category: '업무',
      });

      await waitFor(() => {
        expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      });
    });

    it('종료 시간이 겹치는 경우 감지된다', async () => {
      setupMockHandlerCreation([
        {
          id: '1',
          title: '기존 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '새 회의',
        date: '2025-10-15',
        startTime: '08:00',
        endTime: '09:30',
        description: '설명',
        location: '회의실 A',
        category: '업무',
      });

      await waitFor(() => {
        expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      });
    });

    it('완전히 포함되는 경우 감지된다', async () => {
      setupMockHandlerCreation([
        {
          id: '1',
          title: '기존 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '12:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '새 회의',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '회의실 A',
        category: '업무',
      });

      await waitFor(() => {
        expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      });
    });
  });
});

