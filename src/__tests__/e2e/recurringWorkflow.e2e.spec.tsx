import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { setupMockHandlerListCreation, setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
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

describe('E2E - 반복 일정 워크플로우', () => {
  it('반복 일정 생성 → 단일/전체 편집/삭제 플로우', async () => {
    setupMockHandlerListCreation();
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 반복 일정 생성 (매주)
    await user.type(screen.getByLabelText('제목'), '헬스');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '07:00');
    await user.type(screen.getByLabelText('종료 시간'), '08:00');
    await user.click(screen.getByLabelText('반복 일정'));
    // 체크 시 기본값 daily, 간격 1로 설정됨
    await user.type(screen.getByLabelText('반복 간격'), '1');
    await user.click(screen.getByTestId('event-submit-button'));

    const list = within(await screen.findByTestId('event-list'));
    expect(list.getByText('헬스')).toBeInTheDocument();
    // 반복 아이콘 존재 확인
    expect(screen.getAllByTestId('RepeatIcon').length).toBeGreaterThan(0);

    // 편집 → 다이얼로그(예)
    const edit = await screen.findAllByLabelText('Edit event');
    await user.click(edit[0]);
    expect(await screen.findByText('반복 일정 수정')).toBeInTheDocument();
    await user.click(screen.getByText('예'));
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '헬스(단일 수정)');
    await user.click(screen.getByTestId('event-submit-button'));
    expect(within(await screen.findByTestId('event-list')).getByText('헬스(단일 수정)')).toBeInTheDocument();

    // 다시 편집 → 다이얼로그(아니오)
    const edit2 = await screen.findAllByLabelText('Edit event');
    await user.click(edit2[0]);
    expect(await screen.findByText('반복 일정 수정')).toBeInTheDocument();
    await user.click(screen.getByText('아니오'));
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '헬스(전체 수정)');
    await user.click(screen.getByTestId('event-submit-button'));
    expect(within(await screen.findByTestId('event-list')).getAllByText('헬스(전체 수정)').length).toBeGreaterThan(0);

    // 삭제 → 삭제 다이얼로그(예)
    const del = await screen.findAllByLabelText('Delete event');
    await user.click(del[0]);
    expect(await screen.findByText('반복 일정 삭제')).toBeInTheDocument();
    await user.click(screen.getByText('예'));
  }, 15000);
});


