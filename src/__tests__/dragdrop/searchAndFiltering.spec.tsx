import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import App from '../../App';
import { server } from '../../setupTests';

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

describe('검색 및 필터링 전반 검증', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-15T12:00:00'));
  });

  afterEach(() => {
    server.resetHandlers();
    vi.useRealTimers();
  });

  describe('검색 기능', () => {
    beforeEach(() => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '1',
                title: '팀 회의',
                date: '2025-10-15',
                startTime: '09:00',
                endTime: '10:00',
                description: '주간 팀 미팅',
                location: '회의실 A',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime: 10,
              },
              {
                id: '2',
                title: '프로젝트 계획',
                date: '2025-10-16',
                startTime: '14:00',
                endTime: '15:00',
                description: '새 프로젝트 계획 수립',
                location: '회의실 B',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime: 10,
              },
              {
                id: '3',
                title: '개인 미팅',
                date: '2025-10-17',
                startTime: '11:00',
                endTime: '12:00',
                description: '개인적인 일정',
                location: '카페',
                category: '개인',
                repeat: { type: 'none', interval: 0 },
                notificationTime: 60,
              },
            ],
          });
        })
      );
    });

    it('검색어 입력 시 제목으로 검색된다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
      await user.type(searchInput, '팀 회의');

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('팀 회의')).toBeInTheDocument();
        expect(eventList.queryByText('프로젝트 계획')).not.toBeInTheDocument();
        expect(eventList.queryByText('개인 미팅')).not.toBeInTheDocument();
      });
    });

    it('검색어 입력 시 설명으로 검색된다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
      await user.type(searchInput, '주간');

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('팀 회의')).toBeInTheDocument();
      });
    });

    it('검색어 입력 시 위치로 검색된다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
      await user.type(searchInput, '회의실 A');

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('팀 회의')).toBeInTheDocument();
      });
    });

    it('검색 결과가 없으면 "검색 결과가 없습니다."가 표시된다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
      await user.type(searchInput, '존재하지 않는 일정');

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
      });
    });

    it('검색어를 지우면 모든 일정이 다시 표시된다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
      await user.type(searchInput, '팀 회의');

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('팀 회의')).toBeInTheDocument();
      });

      await user.clear(searchInput);

      await waitFor(() => {
        expect(eventList.getByText('팀 회의')).toBeInTheDocument();
        expect(eventList.getByText('프로젝트 계획')).toBeInTheDocument();
        expect(eventList.getByText('개인 미팅')).toBeInTheDocument();
      });
    });

    it('대소문자 구분 없이 검색된다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
      await user.type(searchInput, '팀 회의');

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('팀 회의')).toBeInTheDocument();
      });

      await user.clear(searchInput);
      await user.type(searchInput, '팀');

      await waitFor(() => {
        expect(eventList.getByText('팀 회의')).toBeInTheDocument();
      });
    });

    it('부분 문자열 검색이 가능하다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
      await user.type(searchInput, '프로젝트');

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('프로젝트 계획')).toBeInTheDocument();
      });
    });
  });

  describe('필터링 기능 (뷰 기반)', () => {
    beforeEach(() => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '1',
                title: '이번주 회의',
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
                title: '다음주 회의',
                date: '2025-10-22',
                startTime: '14:00',
                endTime: '15:00',
                description: '설명',
                location: '위치',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime: 10,
              },
              {
                id: '3',
                title: '이번달 회의',
                date: '2025-10-28',
                startTime: '11:00',
                endTime: '12:00',
                description: '설명',
                location: '위치',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime: 10,
              },
            ],
          });
        })
      );
    });

    it('주간 뷰에서 해당 주의 일정만 필터링된다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      const weekView = within(screen.getByTestId('week-view'));
      await waitFor(() => {
        expect(weekView.getByText('이번주 회의')).toBeInTheDocument();
        expect(weekView.queryByText('다음주 회의')).not.toBeInTheDocument();
      });

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('이번주 회의')).toBeInTheDocument();
        expect(eventList.queryByText('다음주 회의')).not.toBeInTheDocument();
      });
    });

    it('월간 뷰에서 해당 월의 일정만 필터링된다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'month-option' }));

      const monthView = within(screen.getByTestId('month-view'));
      await waitFor(() => {
        expect(monthView.getByText('이번주 회의')).toBeInTheDocument();
        expect(monthView.getByText('이번달 회의')).toBeInTheDocument();
        expect(monthView.queryByText('다음주 회의')).not.toBeInTheDocument();
      });
    });

    it('뷰 전환 시 필터링이 업데이트된다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const eventList = within(screen.getByTestId('event-list'));

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      await waitFor(() => {
        expect(eventList.getByText('이번주 회의')).toBeInTheDocument();
        expect(eventList.queryByText('다음주 회의')).not.toBeInTheDocument();
      });

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'month-option' }));

      await waitFor(() => {
        expect(eventList.getByText('이번주 회의')).toBeInTheDocument();
        expect(eventList.getByText('이번달 회의')).toBeInTheDocument();
      });
    });
  });

  describe('검색과 필터링 통합', () => {
    beforeEach(() => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '1',
                title: '팀 회의',
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
                title: '팀 미팅',
                date: '2025-10-22',
                startTime: '14:00',
                endTime: '15:00',
                description: '설명',
                location: '위치',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime: 10,
              },
              {
                id: '3',
                title: '프로젝트 회의',
                date: '2025-10-16',
                startTime: '11:00',
                endTime: '12:00',
                description: '설명',
                location: '위치',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime: 10,
              },
            ],
          });
        })
      );
    });

    it('검색과 주간 필터링이 동시에 작동한다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
      await user.type(searchInput, '팀');

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('팀 회의')).toBeInTheDocument();
        expect(eventList.queryByText('팀 미팅')).not.toBeInTheDocument();
        expect(eventList.queryByText('프로젝트 회의')).not.toBeInTheDocument();
      });
    });

    it('검색과 월간 필터링이 동시에 작동한다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'month-option' }));

      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
      await user.type(searchInput, '팀');

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('팀 회의')).toBeInTheDocument();
        expect(eventList.getByText('팀 미팅')).toBeInTheDocument();
        expect(eventList.queryByText('프로젝트 회의')).not.toBeInTheDocument();
      });
    });

    it('검색어를 변경하면 필터링이 업데이트된다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
      await user.type(searchInput, '팀');

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('팀 회의')).toBeInTheDocument();
        expect(eventList.getByText('팀 미팅')).toBeInTheDocument();
      });

      await user.clear(searchInput);
      await user.type(searchInput, '프로젝트');

      await waitFor(() => {
        expect(eventList.queryByText('팀 회의')).not.toBeInTheDocument();
        expect(eventList.queryByText('팀 미팅')).not.toBeInTheDocument();
        expect(eventList.getByText('프로젝트 회의')).toBeInTheDocument();
      });
    });
  });

  describe('네비게이션과 필터링 통합', () => {
    beforeEach(() => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '1',
                title: '이번주 회의',
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
                title: '다음주 회의',
                date: '2025-10-22',
                startTime: '14:00',
                endTime: '15:00',
                description: '설명',
                location: '위치',
                category: '업무',
                repeat: { type: 'none', interval: 0 },
                notificationTime: 10,
              },
            ],
          });
        })
      );
    });

    it('다음 주로 이동하면 해당 주의 일정만 필터링된다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('이번주 회의')).toBeInTheDocument();
        expect(eventList.queryByText('다음주 회의')).not.toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Next'));

      await waitFor(() => {
        expect(eventList.queryByText('이번주 회의')).not.toBeInTheDocument();
        expect(eventList.getByText('다음주 회의')).toBeInTheDocument();
      });
    });

    it('이전 주로 이동하면 해당 주의 일정만 필터링된다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      await user.click(screen.getByLabelText('Next'));

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('다음주 회의')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Previous'));

      await waitFor(() => {
        expect(eventList.getByText('이번주 회의')).toBeInTheDocument();
        expect(eventList.queryByText('다음주 회의')).not.toBeInTheDocument();
      });
    });
  });
});
