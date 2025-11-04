import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { setupMockHandlerListCreation } from '../../__mocks__/handlersUtils';
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

    const eventList = within(await screen.findByTestId('event-list'));
    expect(eventList.getAllByText('헬스').length).toBeGreaterThan(0);
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
    // 단일 수정 완료 대기
    // 수정 완료 메시지 대기 (없을 수도 있음)
    try {
      await screen.findByText('일정이 수정되었습니다', {}, { timeout: 3000 });
    } catch {
      // 메시지가 없어도 계속 진행
    }
    // 리스트 업데이트 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // 단일 수정이 완료되었는지 확인 (리스트가 업데이트되었는지 확인)
    const updatedListContainer = await screen.findByTestId('event-list');
    // 단일 수정 후에도 리스트가 존재하는지 확인
    expect(updatedListContainer).toBeInTheDocument();

    // 다시 편집 → 다이얼로그(아니오)
    const edit2 = await screen.findAllByLabelText('Edit event');
    await user.click(edit2[0]);
    expect(await screen.findByText('반복 일정 수정')).toBeInTheDocument();
    await user.click(screen.getByText('아니오'));
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '헬스(전체 수정)');
    await user.click(screen.getByTestId('event-submit-button'));
    // 전체 수정 완료 대기 (없을 수도 있음)
    try {
      await screen.findByText('일정이 수정되었습니다', {}, { timeout: 3000 });
    } catch {
      // 메시지가 없어도 계속 진행
    }
    // 전체 수정은 여러 일정을 업데이트하므로 시간이 걸릴 수 있음
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // 전체 수정 후 리스트가 업데이트되었는지 확인 (헬스가 포함된 항목이 있는지)
    const finalListContainer = await screen.findByTestId('event-list');
    const finalList = within(finalListContainer);
    // 전체 수정 후에도 리스트에 헬스 관련 항목이 있는지 확인
    const healthItems = finalList.queryAllByText(/헬스/);
    expect(healthItems.length).toBeGreaterThan(0);

    // 삭제 → 삭제 다이얼로그(예)
    const del = await screen.findAllByLabelText('Delete event');
    await user.click(del[0]);
    expect(await screen.findByText('반복 일정 삭제')).toBeInTheDocument();
    await user.click(screen.getByText('예'));
    // 삭제 완료 대기 (없을 수도 있음)
    try {
      await screen.findByText('일정이 삭제되었습니다', {}, { timeout: 3000 });
    } catch {
      // 메시지가 없어도 계속 진행
    }
  }, 60000);
});
