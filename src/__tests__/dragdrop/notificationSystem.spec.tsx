import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import App from '../../App';
import { server } from '../../setupTests';
import { http, HttpResponse } from 'msw';

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

describe('알림 시스템 관련 노출 조건 검증', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    server.resetHandlers();
    vi.useRealTimers();
  });

  describe('알림 노출 타이밍', () => {
    it('알림 시간 정확히 도달 시 알림이 표시된다', async () => {
      const notificationTime = 10; // 10분 전
      const eventStartTime = new Date('2025-10-15T14:00:00');
      const notificationTimeInMs = notificationTime * 60 * 1000;
      const currentTime = new Date(eventStartTime.getTime() - notificationTimeInMs);

      vi.setSystemTime(currentTime);

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '1',
                title: '알림 테스트 일정',
                date: '2025-10-15',
                startTime: '14:00',
                endTime: '15:00',
                description: '설명',
                location: '위치',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime,
              },
            ],
          });
        })
      );

      setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      expect(screen.queryByText('10분 후 알림 테스트 일정 일정이 시작됩니다.')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('10분 후 알림 테스트 일정 일정이 시작됩니다.')).toBeInTheDocument();
      });
    });

    it('알림 시간 전에는 알림이 표시되지 않는다', async () => {
      const notificationTime = 10; // 10분 전
      const eventStartTime = new Date('2025-10-15T14:00:00');
      const notificationTimeInMs = notificationTime * 60 * 1000;
      const currentTime = new Date(eventStartTime.getTime() - notificationTimeInMs - 60000); // 11분 전

      vi.setSystemTime(currentTime);

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '1',
                title: '알림 테스트 일정',
                date: '2025-10-15',
                startTime: '14:00',
                endTime: '15:00',
                description: '설명',
                location: '위치',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime,
              },
            ],
          });
        })
      );

      setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.queryByText('10분 후 알림 테스트 일정 일정이 시작됩니다.')).not.toBeInTheDocument();
    });

    it('일정 시작 시간 이후에는 알림이 표시되지 않는다', async () => {
      const notificationTime = 10;
      const eventStartTime = new Date('2025-10-15T14:00:00');
      const currentTime = new Date(eventStartTime.getTime() + 60000); // 시작 시간 1분 후

      vi.setSystemTime(currentTime);

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '1',
                title: '알림 테스트 일정',
                date: '2025-10-15',
                startTime: '14:00',
                endTime: '15:00',
                description: '설명',
                location: '위치',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime,
              },
            ],
          });
        })
      );

      setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.queryByText('10분 후 알림 테스트 일정 일정이 시작됩니다.')).not.toBeInTheDocument();
    });
  });

  describe('알림 메시지 내용', () => {
    it('알림 메시지에 일정 제목이 포함된다', async () => {
      const notificationTime = 10;
      const eventStartTime = new Date('2025-10-15T14:00:00');
      const notificationTimeInMs = notificationTime * 60 * 1000;
      const currentTime = new Date(eventStartTime.getTime() - notificationTimeInMs);

      vi.setSystemTime(currentTime);

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '1',
                title: '중요한 회의',
                date: '2025-10-15',
                startTime: '14:00',
                endTime: '15:00',
                description: '설명',
                location: '위치',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime,
              },
            ],
          });
        })
      );

      setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/중요한 회의/)).toBeInTheDocument();
      });
    });

    it('알림 메시지에 알림 시간이 포함된다', async () => {
      const notificationTime = 60; // 1시간 전
      const eventStartTime = new Date('2025-10-15T14:00:00');
      const notificationTimeInMs = notificationTime * 60 * 1000;
      const currentTime = new Date(eventStartTime.getTime() - notificationTimeInMs);

      vi.setSystemTime(currentTime);

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '1',
                title: '알림 테스트 일정',
                date: '2025-10-15',
                startTime: '14:00',
                endTime: '15:00',
                description: '설명',
                location: '위치',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime,
              },
            ],
          });
        })
      );

      setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('60분 후 알림 테스트 일정 일정이 시작됩니다.')).toBeInTheDocument();
      });
    });
  });

  describe('중복 알림 방지', () => {
    it('이미 알림이 표시된 일정은 다시 알림이 표시되지 않는다', async () => {
      const notificationTime = 10;
      const eventStartTime = new Date('2025-10-15T14:00:00');
      const notificationTimeInMs = notificationTime * 60 * 1000;
      const currentTime = new Date(eventStartTime.getTime() - notificationTimeInMs);

      vi.setSystemTime(currentTime);

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '1',
                title: '알림 테스트 일정',
                date: '2025-10-15',
                startTime: '14:00',
                endTime: '15:00',
                description: '설명',
                location: '위치',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime,
              },
            ],
          });
        })
      );

      setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('10분 후 알림 테스트 일정 일정이 시작됩니다.')).toBeInTheDocument();
      });

      const initialNotifications = screen.getAllByText('10분 후 알림 테스트 일정 일정이 시작됩니다.');

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      const afterNotifications = screen.queryAllByText('10분 후 알림 테스트 일정 일정이 시작됩니다.');
      expect(afterNotifications.length).toBe(initialNotifications.length);
    });
  });

  describe('여러 일정 알림 처리', () => {
    it('여러 일정의 알림이 동시에 표시될 수 있다', async () => {
      const notificationTime = 10;
      const eventStartTime1 = new Date('2025-10-15T14:00:00');
      const eventStartTime2 = new Date('2025-10-15T15:00:00');
      const notificationTimeInMs = notificationTime * 60 * 1000;
      const currentTime = new Date(eventStartTime1.getTime() - notificationTimeInMs);

      vi.setSystemTime(currentTime);

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '1',
                title: '첫 번째 회의',
                date: '2025-10-15',
                startTime: '14:00',
                endTime: '14:30',
                description: '설명',
                location: '위치',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime,
              },
              {
                id: '2',
                title: '두 번째 회의',
                date: '2025-10-15',
                startTime: '15:00',
                endTime: '15:30',
                description: '설명',
                location: '위치',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime,
              },
            ],
          });
        })
      );

      setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('10분 후 첫 번째 회의 일정이 시작됩니다.')).toBeInTheDocument();
      });

      act(() => {
        vi.setSystemTime(new Date(eventStartTime2.getTime() - notificationTimeInMs));
        vi.advanceTimersByTime(60000);
      });

      await waitFor(() => {
        expect(screen.getByText('10분 후 두 번째 회의 일정이 시작됩니다.')).toBeInTheDocument();
      });
    });
  });

  describe('알림 제거 기능', () => {
    it('알림을 닫을 수 있다', async () => {
      const notificationTime = 10;
      const eventStartTime = new Date('2025-10-15T14:00:00');
      const notificationTimeInMs = notificationTime * 60 * 1000;
      const currentTime = new Date(eventStartTime.getTime() - notificationTimeInMs);

      vi.setSystemTime(currentTime);

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '1',
                title: '알림 테스트 일정',
                date: '2025-10-15',
                startTime: '14:00',
                endTime: '15:00',
                description: '설명',
                location: '위치',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime,
              },
            ],
          });
        })
      );

      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('10분 후 알림 테스트 일정 일정이 시작됩니다.')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('10분 후 알림 테스트 일정 일정이 시작됩니다.')).not.toBeInTheDocument();
      });
    });
  });

  describe('알림이 표시된 일정의 시각적 표시', () => {
    it('알림이 표시된 일정은 리스트에서 강조 표시된다', async () => {
      const notificationTime = 10;
      const eventStartTime = new Date('2025-10-15T14:00:00');
      const notificationTimeInMs = notificationTime * 60 * 1000;
      const currentTime = new Date(eventStartTime.getTime() - notificationTimeInMs);

      vi.setSystemTime(currentTime);

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '1',
                title: '알림 테스트 일정',
                date: '2025-10-15',
                startTime: '14:00',
                endTime: '15:00',
                description: '설명',
                location: '위치',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime,
              },
            ],
          });
        })
      );

      setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        const notifications = eventList.queryAllByLabelText(/Notifications/i);
        expect(notifications.length).toBeGreaterThan(0);
      });
    });

    it('알림이 표시된 일정은 캘린더 뷰에서도 강조 표시된다', async () => {
      const notificationTime = 10;
      const eventStartTime = new Date('2025-10-15T14:00:00');
      const notificationTimeInMs = notificationTime * 60 * 1000;
      const currentTime = new Date(eventStartTime.getTime() - notificationTimeInMs);

      vi.setSystemTime(currentTime);

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '1',
                title: '알림 테스트 일정',
                date: '2025-10-15',
                startTime: '14:00',
                endTime: '15:00',
                description: '설명',
                location: '위치',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime,
              },
            ],
          });
        })
      );

      setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        const monthView = within(screen.getByTestId('month-view'));
        const notifications = monthView.queryAllByLabelText(/Notifications/i);
        expect(notifications.length).toBeGreaterThan(0);
      });
    });
  });
});

