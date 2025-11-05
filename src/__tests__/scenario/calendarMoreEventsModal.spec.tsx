import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
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

describe('시나리오: 캘린더 일정 더보기 모달', () => {
  // 통합 테스트 1: MonthView에서 일정이 3개 이상인 날짜에 더보기 버튼이 표시되는지
  it('MonthView에서 일정이 3개 이상인 날짜에 더보기 버튼이 표시된다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 같은 날짜에 일정 3개 생성
    const events = [
      { title: '회의 A', date: '2025-10-15', startTime: '09:00', endTime: '10:00' },
      { title: '회의 B', date: '2025-10-15', startTime: '14:00', endTime: '15:00' },
      { title: '회의 C', date: '2025-10-15', startTime: '16:00', endTime: '17:00' },
    ];

    for (const event of events) {
      await user.type(screen.getByLabelText('제목'), event.title);
      await user.type(screen.getByLabelText('날짜'), event.date);
      await user.type(screen.getByLabelText('시작 시간'), event.startTime);
      await user.type(screen.getByLabelText('종료 시간'), event.endTime);
      await user.click(screen.getByTestId('event-submit-button'));
      await user.clear(screen.getByLabelText('제목'));
      await user.clear(screen.getByLabelText('시작 시간'));
      await user.clear(screen.getByLabelText('종료 시간'));
    }

    // 일정 생성 후 캘린더 업데이트 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // MonthView에서 첫 번째, 두 번째 일정과 더보기 버튼 확인
    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toHaveTextContent('회의 A');
    expect(monthView).toHaveTextContent('회의 B');
    expect(monthView).toHaveTextContent('더보기');
    // 세 번째 일정은 직접 표시되지 않음
    expect(monthView).not.toHaveTextContent('회의 C');
  }, 30000);

  // 통합 테스트 2: WeekView에서 일정이 3개 이상인 날짜에 더보기 버튼이 표시되는지
  it('WeekView에서 일정이 3개 이상인 날짜에 더보기 버튼이 표시된다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 주간 뷰로 전환 (Select를 직접 찾아서 클릭)
    // 다른 테스트 파일의 패턴을 따라: combobox를 먼저 클릭
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    // Select가 열린 후 MenuItem을 찾음 (다른 테스트 파일과 동일한 방식)
    const weekOption = await screen.findByRole('option', { name: 'week-option' });
    await user.click(weekOption);

    // WeekView는 현재 주를 표시하므로, 현재 주의 날짜(2025-10-01)에 일정 생성
    // 같은 날짜에 일정 3개 생성
    const events = [
      { title: '회의 A', date: '2025-10-01', startTime: '09:00', endTime: '10:00' },
      { title: '회의 B', date: '2025-10-01', startTime: '14:00', endTime: '15:00' },
      { title: '회의 C', date: '2025-10-01', startTime: '16:00', endTime: '17:00' },
    ];

    for (const event of events) {
      await user.type(screen.getByLabelText('제목'), event.title);
      await user.type(screen.getByLabelText('날짜'), event.date);
      await user.type(screen.getByLabelText('시작 시간'), event.startTime);
      await user.type(screen.getByLabelText('종료 시간'), event.endTime);
      await user.click(screen.getByTestId('event-submit-button'));
      await user.clear(screen.getByLabelText('제목'));
      await user.clear(screen.getByLabelText('시작 시간'));
      await user.clear(screen.getByLabelText('종료 시간'));
    }

    // 일정 생성 후 캘린더 업데이트 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // WeekView에서 첫 번째, 두 번째 일정과 더보기 버튼 확인
    const weekView = await screen.findByTestId('week-view');
    expect(weekView).toHaveTextContent('회의 A');
    expect(weekView).toHaveTextContent('회의 B');
    expect(weekView).toHaveTextContent('더보기');
  }, 30000);

  // 통합 테스트 3: 더보기 버튼 클릭 시 모달이 열리고 해당 날짜의 일정만 표시되는지
  it('더보기 버튼 클릭 시 모달이 열리고 해당 날짜의 일정만 표시된다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 같은 날짜에 일정 3개 생성
    const events = [
      { title: '회의 A', date: '2025-10-15', startTime: '09:00', endTime: '10:00' },
      { title: '회의 B', date: '2025-10-15', startTime: '14:00', endTime: '15:00' },
      { title: '회의 C', date: '2025-10-15', startTime: '16:00', endTime: '17:00' },
    ];

    for (const event of events) {
      await user.type(screen.getByLabelText('제목'), event.title);
      await user.type(screen.getByLabelText('날짜'), event.date);
      await user.type(screen.getByLabelText('시작 시간'), event.startTime);
      await user.type(screen.getByLabelText('종료 시간'), event.endTime);
      await user.click(screen.getByTestId('event-submit-button'));
      await user.clear(screen.getByLabelText('제목'));
      await user.clear(screen.getByLabelText('시작 시간'));
      await user.clear(screen.getByLabelText('종료 시간'));
    }

    // 다른 날짜에 일정 1개 생성 (모달에 표시되지 않아야 함)
    await user.type(screen.getByLabelText('제목'), '다른 날짜 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-20');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.click(screen.getByTestId('event-submit-button'));

    // 일정 생성 후 캘린더 업데이트 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 더보기 버튼 클릭
    const monthView = await screen.findByTestId('month-view');
    const moreButton = within(monthView).getByText(/더보기/);
    await user.click(moreButton);

    // 모달 확인 - 해당 날짜의 일정만 표시
    const modal = await screen.findByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveTextContent('회의 A');
    expect(modal).toHaveTextContent('회의 B');
    expect(modal).toHaveTextContent('회의 C');
    // 다른 날짜의 일정은 표시되지 않음
    expect(modal).not.toHaveTextContent('다른 날짜 회의');
  }, 30000);

  // 통합 테스트 4: 모달에서 일정 제목 클릭 시 EventFormPanel에 일정 정보가 채워지는지
  it('모달에서 일정 제목 클릭 시 EventFormPanel에 일정 정보가 채워진다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 일정 3개 생성
    await user.type(screen.getByLabelText('제목'), '수정할 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.click(screen.getByTestId('event-submit-button'));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '다른 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '14:00');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '15:00');
    await user.click(screen.getByTestId('event-submit-button'));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '세 번째 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '16:00');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '17:00');
    await user.click(screen.getByTestId('event-submit-button'));

    // 일정 생성 후 캘린더 업데이트 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 더보기 버튼 클릭
    const monthView = await screen.findByTestId('month-view');
    const moreButton = within(monthView).getByText(/더보기/);
    await user.click(moreButton);

    // 모달에서 일정 제목 클릭
    const modal = await screen.findByRole('dialog');
    const eventTitle = within(modal).getByText('수정할 회의');
    await user.click(eventTitle);

    // 반복 일정 다이얼로그가 열릴 수 있으므로 처리
    const recurringDialog = screen.queryByText('반복 일정 수정');
    if (recurringDialog) {
      // 반복 일정인 경우 "예" 클릭 (단일 편집)
      await user.click(screen.getByText('예'));
    }

    // 모달이 닫히고 EventFormPanel에 정보가 채워짐
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toHaveValue('수정할 회의');
    expect(screen.getByLabelText('날짜')).toHaveValue('2025-10-15');
    expect(screen.getByLabelText('시작 시간')).toHaveValue('09:00');
    expect(screen.getByLabelText('종료 시간')).toHaveValue('10:00');
    // EventFormPanel 타이틀이 "일정 수정"으로 표시되는지 확인 (h4 요소)
    // editingEvent가 있으므로 "일정 수정"이어야 함
    const h4Title = screen.getByRole('heading', { level: 4, name: /^일정( 수정| 추가)?$/ });
    expect(h4Title).toBeInTheDocument();
    // "일정 수정" 텍스트 확인
    expect(h4Title).toHaveTextContent('일정 수정');
  }, 30000);
});
