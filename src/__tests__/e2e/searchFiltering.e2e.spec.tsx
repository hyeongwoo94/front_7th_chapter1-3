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

describe('E2E - 검색 및 필터링', () => {
  it('검색어에 따라 리스트와 캘린더가 필터링된다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 주간 뷰로 전환 (기본 뷰가 month이므로 month-view에서 테스트)
    // 주간 뷰 전환은 복잡하므로 월간 뷰에서 검색 필터링 테스트

    // 이벤트 2개 생성
    await user.type(screen.getByLabelText('제목'), '개발 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '13:00');
    await user.type(screen.getByLabelText('종료 시간'), '14:00');
    await user.click(screen.getByTestId('event-submit-button'));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '디자인 리뷰');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '15:00');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '16:00');
    await user.click(screen.getByTestId('event-submit-button'));

    const list = within(await screen.findByTestId('event-list'));
    expect(list.getByText('개발 회의')).toBeInTheDocument();
    expect(list.getByText('디자인 리뷰')).toBeInTheDocument();

    // 검색
    const search = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(search, '개발');

    // 리스트 필터 확인
    const filteredList = within(await screen.findByTestId('event-list'));
    expect(filteredList.getByText('개발 회의')).toBeInTheDocument();
    expect(filteredList.queryByText('디자인 리뷰')).not.toBeInTheDocument();

    // 캘린더 뷰에도 반영 (월간 뷰)
    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toHaveTextContent('개발 회의');
    expect(monthView).not.toHaveTextContent('디자인 리뷰');
  }, 15000);
});
