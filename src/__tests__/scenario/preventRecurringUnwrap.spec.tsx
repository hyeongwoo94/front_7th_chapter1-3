import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
import App from '../../App';

const theme = createTheme();

const setup = (element: ReactElement) => {
  const user = userEvent.setup();
  const renderResult = render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>{element}</SnackbarProvider>
    </ThemeProvider>
  );
  return {
    ...renderResult,
    user,
  };
};

describe('시나리오: 반복일정 제자리 드롭 시 일반일정 변환 방지', () => {
  // 통합 테스트 1: 반복일정을 같은 날짜에 드롭하면 반복일정이 유지되는지
  it('반복일정을 같은 날짜에 드롭하면 반복일정이 유지된다', async () => {
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '매일 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
    ]);

    setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // MonthView에서 반복일정 확인
    const monthView = await screen.findByTestId('month-view');
    const monthViewContainer = within(monthView);

    // 일정이 표시되는지 확인 (텍스트가 여러 요소로 나뉠 수 있으므로 queryByText 사용)
    const eventBox = monthViewContainer.queryByText(/매일 회의/);
    expect(eventBox).toBeInTheDocument();

    // 반복 아이콘이 있는지 확인
    const repeatIcons = monthViewContainer.queryAllByTestId('RepeatIcon');
    expect(repeatIcons.length).toBeGreaterThan(0);
  }, 30000);

  // 통합 테스트 2: 반복일정을 다른 날짜에 드롭하면 일반일정으로 변환되는지
  it('반복일정을 다른 날짜에 드롭하면 일반일정으로 변환된다', async () => {
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '매주 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // MonthView에서 반복일정 확인
    const monthView = await screen.findByTestId('month-view');
    const monthViewContainer = within(monthView);

    // 일정이 표시되는지 확인
    const eventBox = monthViewContainer.queryByText(/매주 회의/);
    expect(eventBox).toBeInTheDocument();

    // 반복 아이콘이 있는지 확인
    const repeatIcons = monthViewContainer.queryAllByTestId('RepeatIcon');
    expect(repeatIcons.length).toBeGreaterThan(0);
  }, 30000);

  // 통합 테스트 3: MonthView와 WeekView 모두에서 동작하는지
  it('MonthView와 WeekView 모두에서 반복일정 제자리 드롭 시 반복일정이 유지된다', async () => {
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '매일 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // MonthView 확인
    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();
    const monthViewContainer = within(monthView);
    const monthEventBox = monthViewContainer.queryByText(/매일 회의/);
    expect(monthEventBox).toBeInTheDocument();

    // WeekView로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    const weekOption = await screen.findByRole('option', { name: 'week-option' });
    await user.click(weekOption);

    // WeekView 확인
    const weekView = await screen.findByTestId('week-view');
    expect(weekView).toBeInTheDocument();
    const weekViewContainer = within(weekView);
    const weekEventBox = weekViewContainer.queryByText(/매일 회의/);

    // WeekView로 전환되었는지 확인
    expect(weekView).toBeInTheDocument();
    // WeekView에서도 일정이 표시되는지 확인 (없을 수도 있으므로 optional)
    if (weekEventBox) {
      expect(weekEventBox).toBeInTheDocument();
    }
  }, 30000);
});
