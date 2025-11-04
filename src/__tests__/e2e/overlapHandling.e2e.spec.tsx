import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';

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

describe('E2E - 일정 겹침 처리', () => {
  it('겹침 경고 다이얼로그가 노출되고 계속 진행 시 저장된다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 첫 일정 생성
    await user.type(screen.getByLabelText('제목'), '회의A');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.click(screen.getByTestId('event-submit-button'));

    // 겹치는 일정 생성
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '회의B');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '09:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '10:30');
    await user.click(screen.getByTestId('event-submit-button'));

    // 다이얼로그 확인 및 진행
    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/회의A/)).toBeInTheDocument();
    await user.click(screen.getByText('계속 진행'));

    // 결과 확인
    const list = within(await screen.findByTestId('event-list'));
    expect(list.getByText('회의A')).toBeInTheDocument();
    expect(list.getByText('회의B')).toBeInTheDocument();
  }, 15000);
});


