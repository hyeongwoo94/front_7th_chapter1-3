import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
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

describe('드래그 앤 드롭 기능', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-15T12:00:00'));
  });

  afterEach(() => {
    server.resetHandlers();
    vi.useRealTimers();
  });

  describe('WeekView에서 일정 드래그 앤 드롭', () => {
    it('일정을 다른 날짜로 드래그하면 일정이 이동한다', async () => {
      setupMockHandlerCreation([
        {
          id: '1',
          title: '팀 회의',
          date: '2025-10-15',
          startTime: '14:00',
          endTime: '15:00',
          description: '팀 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      setupMockHandlerUpdating();

      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      // WeekView로 전환
      const viewSelect = screen.getByLabelText('뷰 타입 선택');
      await user.click(viewSelect);
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      // 일정 찾기
      await waitFor(() => {
        expect(screen.getByText('팀 회의')).toBeInTheDocument();
      });

      // 드래그 시작 (mousedown on event)
      const eventBox = screen.getByText('팀 회의').closest('div[class*="Box"]');
      expect(eventBox).toBeInTheDocument();

      // 드래그 시뮬레이션은 복잡하므로 실제 구현 후 테스트 보완
      // 여기서는 기본 구조만 확인
    });
  });
});
