import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, waitFor, within } from '@testing-library/react';
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

describe('날짜 클릭으로 일정 폼 자동 채우기', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-15T12:00:00'));
  });

  afterEach(() => {
    server.resetHandlers();
    vi.useRealTimers();
  });

  describe('WeekView에서 날짜 클릭', () => {
    beforeEach(() => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [],
          });
        })
      );
    });

    it('빈 날짜 셀을 클릭하면 EventForm의 날짜 필드가 자동으로 채워진다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      // WeekView로 전환
      const viewSelect = screen.getByLabelText('뷰 타입 선택');
      await user.click(viewSelect);
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      // 빈 날짜 셀 찾기 (현재 주의 날짜 중 하나)
      const weekView = screen.getByTestId('week-view');
      await waitFor(() => {
        expect(weekView).toBeInTheDocument();
      });

      // 날짜 숫자 찾기 (15일은 수요일이므로 주의 어딘가에 있을 것)
      const dateCells = within(weekView).getAllByText(/^\d+$/);

      // 첫 번째 빈 셀 클릭 (이벤트가 없는 셀)
      if (dateCells.length > 0) {
        const emptyCell = dateCells[0].closest('td');
        if (emptyCell) {
          await user.click(emptyCell);

          // EventForm의 날짜 필드가 채워졌는지 확인
          await waitFor(() => {
            const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
            expect(dateInput.value).toBeTruthy();
            expect(dateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          });
        }
      }
    });
  });

  describe('MonthView에서 날짜 클릭', () => {
    beforeEach(() => {
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [],
          });
        })
      );
    });

    it('빈 날짜 셀을 클릭하면 EventForm의 날짜 필드가 자동으로 채워진다', async () => {
      const { user } = setup(<App />);

      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      // MonthView로 전환
      const viewSelect = screen.getByLabelText('뷰 타입 선택');
      await user.click(viewSelect);
      await user.click(screen.getByRole('option', { name: 'month-option' }));

      // 빈 날짜 셀 찾기
      const monthView = screen.getByTestId('month-view');
      await waitFor(() => {
        expect(monthView).toBeInTheDocument();
      });

      // 날짜 숫자 찾기
      const dateCells = within(monthView).getAllByText(/^\d+$/);

      // 첫 번째 빈 셀 클릭
      if (dateCells.length > 0) {
        const emptyCell = dateCells[0].closest('td');
        if (emptyCell) {
          await user.click(emptyCell);

          // EventForm의 날짜 필드가 채워졌는지 확인
          await waitFor(() => {
            const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
            expect(dateInput.value).toBeTruthy();
            expect(dateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          });
        }
      }
    });
  });
});
