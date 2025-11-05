import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
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

describe('시나리오: 일정 리스트 클릭 시 폼 자동 채우기 및 UI 개선', () => {
  // 통합 테스트 1: 일정 리스트에서 일정 클릭 시 폼에 정보가 채워지는지
  it('일정 리스트에서 일정 클릭 시 폼에 정보가 채워진다', async () => {
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 일정 리스트에서 일정 찾기
    const eventList = await screen.findByTestId('event-list');

    // 일정 Box 클릭 (일정 제목을 포함한 Box)
    const eventTitle = within(eventList).getByText('팀 회의');
    const eventContainer = eventTitle.closest('div[style*="border"]');
    if (eventContainer) {
      await user.click(eventContainer);
    } else {
      // 대체 방법: 일정 제목 자체를 클릭
      await user.click(eventTitle);
    }

    // 폼에 정보가 채워졌는지 확인
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(screen.getByLabelText('제목')).toHaveValue('팀 회의');
    expect(screen.getByLabelText('날짜')).toHaveValue('2025-10-01');
    expect(screen.getByLabelText('시작 시간')).toHaveValue('09:00');
    expect(screen.getByLabelText('종료 시간')).toHaveValue('10:00');
  }, 30000);

  // 통합 테스트 2: input 필드 클릭 시 버튼이 활성화되는지
  it('input 필드 클릭 시 버튼이 활성화된다', async () => {
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 일정 리스트에서 일정 클릭
    const eventList = await screen.findByTestId('event-list');
    const eventTitle = within(eventList).getByText('팀 회의');
    const eventContainer = eventTitle.closest('div[style*="border"]');
    if (eventContainer) {
      await user.click(eventContainer);
    } else {
      // 대체 방법: 일정 제목 자체를 클릭
      await user.click(eventTitle);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 버튼이 disabled 상태인지 확인
    const submitButton = screen.getByTestId('event-submit-button');
    expect(submitButton).toBeDisabled();

    // input 필드 클릭 (제목 필드)
    const titleInput = screen.getByLabelText('제목');
    await user.click(titleInput);

    // 버튼이 enabled 상태로 변경되었는지 확인
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(submitButton).not.toBeDisabled();
    // editingEvent가 있으므로 버튼 텍스트가 "일정 수정"으로 변경되어야 함
    expect(submitButton).toHaveTextContent('일정 수정');
  }, 30000);
});
