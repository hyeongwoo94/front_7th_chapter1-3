import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils';
import App from '../../App';
import { server } from '../../setupTests';
import { Event, RepeatInfo } from '../../types';

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
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'> & { repeat?: RepeatInfo }
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

describe('기본 일정 관리 워크플로우 전반 (CRUD)', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-15T12:00:00'));
  });

  afterEach(() => {
    server.resetHandlers();
    vi.useRealTimers();
  });

  describe('Create (생성)', () => {
    it('새로운 일정을 생성하고 모든 필드가 정확히 저장된다', async () => {
      setupMockHandlerCreation();
      const { user } = setup(<App />);

      await saveSchedule(user, {
        title: '새 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '프로젝트 진행 상황 논의',
        location: '회의실 A',
        category: '업무',
      });

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('새 회의')).toBeInTheDocument();
      });
      expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
      expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
      expect(eventList.getByText('프로젝트 진행 상황 논의')).toBeInTheDocument();
      expect(eventList.getByText('회의실 A')).toBeInTheDocument();
      expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
    });

    it('모든 카테고리로 일정을 생성할 수 있다', async () => {
      const categories = ['업무', '개인', '가족', '기타'];
      setupMockHandlerCreation();

      for (const category of categories) {
        const { user } = setup(<App />);
        await saveSchedule(user, {
          title: `${category} 일정`,
          date: '2025-10-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '설명',
          location: '위치',
          category,
        });

        const eventList = within(screen.getByTestId('event-list'));
        await waitFor(() => {
          expect(eventList.getByText(`카테고리: ${category}`)).toBeInTheDocument();
        });
      }
    });

    it('알림 설정이 있는 일정을 생성할 수 있다', async () => {
      setupMockHandlerCreation();
      const { user } = setup(<App />);

      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '알림 테스트');
      await user.type(screen.getByLabelText('날짜'), '2025-10-15');
      await user.type(screen.getByLabelText('시작 시간'), '16:00');
      await user.type(screen.getByLabelText('종료 시간'), '17:00');
      await user.type(screen.getByLabelText('설명'), '설명');
      await user.type(screen.getByLabelText('위치'), '위치');
      await user.click(screen.getByLabelText('카테고리'));
      await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: '업무-option' }));

      await user.click(screen.getByLabelText('알림 설정'));
      await user.click(within(screen.getByLabelText('알림 설정')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: '10분 전' }));

      await user.click(screen.getByTestId('event-submit-button'));

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('알림: 10분 전')).toBeInTheDocument();
      });
    });
  });

  describe('Read (조회)', () => {
    it('저장된 일정 목록을 조회할 수 있다', async () => {
      setupMockHandlerUpdating();
      setup(<App />);

      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.getByText('기존 회의')).toBeInTheDocument();
        expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
      });
    });

    it('주간 뷰에서 일정을 조회할 수 있다', async () => {
      setupMockHandlerUpdating();
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      const weekView = within(screen.getByTestId('week-view'));
      await waitFor(() => {
        expect(weekView.getByText('기존 회의')).toBeInTheDocument();
      });
    });

    it('월간 뷰에서 일정을 조회할 수 있다', async () => {
      setupMockHandlerUpdating();
      setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const monthView = within(screen.getByTestId('month-view'));
      await waitFor(() => {
        expect(monthView.getByText('기존 회의')).toBeInTheDocument();
      });
    });

    it('일정 상세 정보를 조회할 수 있다', async () => {
      setupMockHandlerUpdating();
      setup(<App />);

      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.getByText('기존 회의')).toBeInTheDocument();
        expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
        expect(eventList.getByText('09:00 - 10:00')).toBeInTheDocument();
        expect(eventList.getByText('기존 팀 미팅')).toBeInTheDocument();
        expect(eventList.getByText('회의실 B')).toBeInTheDocument();
        expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
      });
    });
  });

  describe('Update (수정)', () => {
    it('일정의 제목을 수정할 수 있다', async () => {
      setupMockHandlerUpdating();
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      await user.click(await screen.findByLabelText('Edit event'));

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 회의 제목');

      await user.click(screen.getByTestId('event-submit-button'));

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('수정된 회의 제목')).toBeInTheDocument();
      });
    });

    it('일정의 시간을 수정할 수 있다', async () => {
      setupMockHandlerUpdating();
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      await user.click(await screen.findByLabelText('Edit event'));

      await user.clear(screen.getByLabelText('시작 시간'));
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.clear(screen.getByLabelText('종료 시간'));
      await user.type(screen.getByLabelText('종료 시간'), '11:00');

      await user.click(screen.getByTestId('event-submit-button'));

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('10:00 - 11:00')).toBeInTheDocument();
      });
    });

    it('일정의 모든 필드를 동시에 수정할 수 있다', async () => {
      setupMockHandlerUpdating();
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      await user.click(await screen.findByLabelText('Edit event'));

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '전면 수정된 회의');
      await user.clear(screen.getByLabelText('설명'));
      await user.type(screen.getByLabelText('설명'), '수정된 설명');
      await user.clear(screen.getByLabelText('위치'));
      await user.type(screen.getByLabelText('위치'), '수정된 위치');
      await user.click(screen.getByLabelText('카테고리'));
      await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: '개인-option' }));

      await user.click(screen.getByTestId('event-submit-button'));

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('전면 수정된 회의')).toBeInTheDocument();
        expect(eventList.getByText('수정된 설명')).toBeInTheDocument();
        expect(eventList.getByText('수정된 위치')).toBeInTheDocument();
        expect(eventList.getByText('카테고리: 개인')).toBeInTheDocument();
      });
    });
  });

  describe('Delete (삭제)', () => {
    it('일정을 삭제할 수 있다', async () => {
      setupMockHandlerDeletion();
      const { user } = setup(<App />);

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('삭제할 이벤트')).toBeInTheDocument();
      });

      const deleteButton = await screen.findByLabelText('Delete event');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(eventList.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
      });
    });

    it('여러 일정 중 특정 일정만 삭제할 수 있다', async () => {
      setupMockHandlerUpdating();
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      const eventList = within(screen.getByTestId('event-list'));
      const deleteButtons = await screen.findAllByLabelText('Delete event');

      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(eventList.queryByText('기존 회의')).not.toBeInTheDocument();
        expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
      });
    });
  });

  describe('CRUD 통합 시나리오', () => {
    it('일정을 생성하고 조회하고 수정하고 삭제하는 전체 워크플로우가 작동한다', async () => {
      setupMockHandlerCreation();
      const { user } = setup(<App />);

      // Create
      await saveSchedule(user, {
        title: '통합 테스트 일정',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '초기 설명',
        location: '초기 위치',
        category: '업무',
      });

      const eventList = within(screen.getByTestId('event-list'));
      await waitFor(() => {
        expect(eventList.getByText('통합 테스트 일정')).toBeInTheDocument();
      });

      // Read & Update
      await user.click(await screen.findByLabelText('Edit event'));

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 통합 테스트 일정');

      await user.click(screen.getByTestId('event-submit-button'));

      await waitFor(() => {
        expect(eventList.getByText('수정된 통합 테스트 일정')).toBeInTheDocument();
      });

      // Delete
      const deleteButton = await screen.findByLabelText('Delete event');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(eventList.queryByText('수정된 통합 테스트 일정')).not.toBeInTheDocument();
      });
    });
  });
});

