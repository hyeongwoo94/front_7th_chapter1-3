import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor } from '@testing-library/react';
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

describe('E2E - 날짜 클릭으로 일정 생성 워크플로우', () => {
  it('빈 날짜 셀 클릭 → 폼 자동 채워짐 → 일정 생성 → 리스트/캘린더 반영', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 1. 빈 날짜 셀 찾기 및 클릭
    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // 날짜 입력 필드 초기값 확인
    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput.value).toBe('');

    // 빈 날짜 셀 찾기 (일정이 없는 셀)
    const cells = screen.getAllByRole('cell');
    const emptyCell = cells.find((cell) => {
      const dateAttr = cell.getAttribute('data-date');
      return dateAttr && !cell.textContent?.includes('일정') && dateAttr.startsWith('2025-10');
    });

    expect(emptyCell).toBeDefined();
    if (emptyCell) {
      const clickedDateISO = emptyCell.getAttribute('data-date');
      expect(clickedDateISO).toBeTruthy();
      
      // ISO 형식을 YYYY-MM-DD로 변환 (handleDateClick이 formatDateToString을 사용)
      // formatDateToString과 동일한 방식으로 변환
      const dateObj = clickedDateISO ? new Date(clickedDateISO) : null;
      const clickedDate = dateObj
        ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
        : null;
      expect(clickedDate).toBeTruthy();

      // 2. 빈 날짜 셀 클릭
      await user.click(emptyCell);

      // 3. 폼에 날짜가 자동으로 채워졌는지 확인
      await waitFor(() => {
        expect(dateInput.value).toBe(clickedDate);
      });

      // 4. 일정 정보 입력
      await user.type(screen.getByLabelText('제목'), '클릭으로 생성한 일정');
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.type(screen.getByLabelText('종료 시간'), '15:00');
      await user.click(screen.getByTestId('event-submit-button'));

      // 5. 일정 생성 완료 확인
      await screen.findByText('일정이 추가되었습니다', {}, { timeout: 5000 });
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 6. 리스트에서 일정 확인
      const eventList = within(await screen.findByTestId('event-list'));
      expect(eventList.getByText('클릭으로 생성한 일정')).toBeInTheDocument();
      if (clickedDate) {
        expect(eventList.getByText(clickedDate)).toBeInTheDocument();
      }

      // 7. 캘린더에서 일정 확인
      const updatedMonthView = await screen.findByTestId('month-view');
      const monthViewContainer = within(updatedMonthView);
      expect(monthViewContainer.getByText('클릭으로 생성한 일정')).toBeInTheDocument();
    }
  }, 30000);

  it('일정이 있는 날짜 셀을 클릭하면 날짜가 채워지지 않는다', async () => {
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '기존 일정',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 날짜 입력 필드 초기값 확인
    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    const initialValue = dateInput.value;

    // MonthView에서 일정이 있는 셀 찾기
    const monthView = await screen.findByTestId('month-view');
    const monthViewContainer = within(monthView);
    const eventBox = monthViewContainer.getByText('기존 일정');
    expect(eventBox).toBeInTheDocument();

    // 일정이 있는 셀의 부모 셀 클릭
    const eventParent = eventBox.closest('td');
    expect(eventParent).toBeDefined();

    if (eventParent) {
      await user.click(eventParent);

      // 날짜 입력 필드가 변경되지 않았는지 확인
      await waitFor(() => {
        expect(dateInput.value).toBe(initialValue);
      });
    }
  }, 30000);

  it('날짜 클릭 → 일정 생성 → 검색 결과에 반영', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 1. 빈 날짜 셀 클릭
    const cells = screen.getAllByRole('cell');
    const emptyCell = cells.find((cell) => {
      const dateAttr = cell.getAttribute('data-date');
      return dateAttr && !cell.textContent?.includes('일정') && dateAttr.startsWith('2025-10');
    });

    if (emptyCell) {
      const clickedDateISO = emptyCell.getAttribute('data-date');
      // ISO 형식을 YYYY-MM-DD로 변환 (formatDateToString과 동일한 방식)
      const dateObj = clickedDateISO ? new Date(clickedDateISO) : null;
      const clickedDate = dateObj
        ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
        : null;
      await user.click(emptyCell);

      // 2. 폼에 날짜 채워짐 확인
      const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
      await waitFor(() => {
        expect(dateInput.value).toBe(clickedDate);
      });

      // 3. 일정 생성
      await user.type(screen.getByLabelText('제목'), '검색 테스트');
      await user.type(screen.getByLabelText('시작 시간'), '16:00');
      await user.type(screen.getByLabelText('종료 시간'), '17:00');
      await user.click(screen.getByTestId('event-submit-button'));

      await screen.findByText('일정이 추가되었습니다', {}, { timeout: 5000 });
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 4. 검색어 입력
      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
      await user.type(searchInput, '검색');

      // 5. 검색 결과에 일정이 표시되는지 확인
      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.getByText('검색 테스트')).toBeInTheDocument();
      });
    }
  }, 30000);

  it('WeekView에서도 날짜 클릭으로 일정 생성이 작동한다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // WeekView로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    const weekOption = await screen.findByRole('option', { name: 'week-option' });
    await user.click(weekOption);

    // WeekView 확인
    const weekView = await screen.findByTestId('week-view');
    expect(weekView).toBeInTheDocument();

    // 날짜 입력 필드 초기값 확인
    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    expect(dateInput.value).toBe('');

    // WeekView에서 빈 날짜 셀 찾기 및 클릭
    const cells = screen.getAllByRole('cell');
    const emptyCell = cells.find((cell) => {
      const dateAttr = cell.getAttribute('data-date');
      return dateAttr && !cell.textContent?.includes('일정');
    });

    if (emptyCell) {
      const clickedDateISO = emptyCell.getAttribute('data-date');
      // ISO 형식을 YYYY-MM-DD로 변환 (formatDateToString과 동일한 방식)
      const dateObj = clickedDateISO ? new Date(clickedDateISO) : null;
      const clickedDate = dateObj
        ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
        : null;
      await user.click(emptyCell);

      // 폼에 날짜가 채워졌는지 확인
      await waitFor(() => {
        expect(dateInput.value).toBe(clickedDate);
      });

      // 일정 생성
      await user.type(screen.getByLabelText('제목'), 'WeekView 일정');
      await user.type(screen.getByLabelText('시작 시간'), '18:00');
      await user.type(screen.getByLabelText('종료 시간'), '19:00');
      await user.click(screen.getByTestId('event-submit-button'));

      // 생성 완료 확인
      await screen.findByText('일정이 추가되었습니다', {}, { timeout: 5000 });
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // WeekView에서 일정 확인
      const updatedWeekView = await screen.findByTestId('week-view');
      const weekViewContainer = within(updatedWeekView);
      expect(weekViewContainer.getByText('WeekView 일정')).toBeInTheDocument();
    }
  }, 30000);
});

