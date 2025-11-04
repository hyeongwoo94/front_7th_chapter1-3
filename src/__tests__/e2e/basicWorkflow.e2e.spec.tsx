import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
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

describe('E2E - 기본 일정 관리 워크플로우', () => {
  it('생성 → 수정 → 삭제, 리스트/캘린더 반영', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 생성
    await user.type(screen.getByLabelText('제목'), '회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '프로젝트 킥오프');
    await user.type(screen.getByLabelText('위치'), '회의실');
    await user.click(screen.getByTestId('event-submit-button'));

    // 리스트/캘린더 확인
    const list = within(await screen.findByTestId('event-list'));
    expect(list.getByText('회의')).toBeInTheDocument();
    expect(list.getByText('2025-10-01')).toBeInTheDocument();
    expect(await screen.findByTestId('week-view')).toHaveTextContent('회의');

    // 수정 (제목 변경)
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);
    const title = screen.getByLabelText('제목');
    await user.clear(title);
    await user.type(title, '회의(수정)');
    await user.click(screen.getByTestId('event-submit-button'));

    expect(within(await screen.findByTestId('event-list')).getByText('회의(수정)')).toBeInTheDocument();
    expect(await screen.findByTestId('week-view')).toHaveTextContent('회의(수정)');

    // 삭제
    const deleteButtons = await screen.findAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);

    // 리스트에서 사라짐
    expect(within(await screen.findByTestId('event-list')).queryByText('회의(수정)')).not.toBeInTheDocument();
  });
});


