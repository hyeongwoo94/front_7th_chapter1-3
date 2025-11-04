import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
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

describe('E2E - 알림 시스템 노출 조건', () => {
  it('임박 이벤트가 있으면 알림 스택이 표시된다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 현재 테스트 환경 시간: 2025-10-01T00:00:00Z (setupTests.ts)
    await user.type(screen.getByLabelText('제목'), '임박 알림 테스트');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '00:05'); // 5분 뒤 시작
    await user.type(screen.getByLabelText('종료 시간'), '00:35');
    await user.click(screen.getByTestId('event-submit-button'));

    // useNotifications는 1초마다 체크. shouldAdvanceTime=true로 시간이 흐름
    // 알림 스택 표시 확인
    await screen.findByText(/임박 알림 테스트/);
  });
});


