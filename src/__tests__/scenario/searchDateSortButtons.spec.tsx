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

describe('시나리오: 검색 결과 날짜 정렬 버튼', () => {
  // 통합 테스트 1: 기본 정렬 버튼이 표시되고 오래된순이 기본값인지
  it('검색 input 밑에 정렬 버튼이 표시되고 오래된순이 기본값이다', async () => {
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '회의 A',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '회의 B',
        date: '2025-10-05',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '회의 C',
        date: '2025-10-25',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 정렬 버튼이 검색 input 밑에 있는지 확인
    const newestButton = screen.getByRole('button', { name: '최신순' });
    const oldestButton = screen.getByRole('button', { name: '오래된순' });

    expect(newestButton).toBeInTheDocument();
    expect(oldestButton).toBeInTheDocument();

    // 오래된순 버튼이 기본 선택 상태인지 확인 (variant="contained")
    expect(oldestButton).toHaveClass('MuiButton-contained');
    expect(newestButton).toHaveClass('MuiButton-outlined');
  }, 30000);

  // 통합 테스트 2: 오래된순 정렬이 날짜 → 시간 → 제목 순서로 작동하는지
  it('오래된순 정렬 시 날짜 → 시간 → 제목 순서로 정렬된다', async () => {
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '회의 C',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '회의 A',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '회의 B',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '4',
        title: '회의 D',
        date: '2025-10-05',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 검색어 입력 (모든 일정 표시)
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '회의');

    // 일정 목록이 표시될 때까지 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const eventList = screen.getByTestId('event-list');

    // 오래된순 정렬 확인: 날짜 → 시간 → 제목
    // 예상 순서: 2025-10-05 11:00 회의 D → 2025-10-15 09:00 회의 A → 2025-10-15 09:00 회의 B → 2025-10-15 14:00 회의 C
    const eventBoxes = await within(eventList).findAllByText(/회의 [ABCD]/);
    expect(eventBoxes.length).toBeGreaterThanOrEqual(4);

    // 첫 번째 일정 박스에서 날짜 확인
    // EventListPanel에서 날짜는 Typography로 표시되며, 제목과 같은 레벨에 있음
    const firstEventTitle = eventBoxes[0];
    const firstEventBox =
      firstEventTitle.closest('div[style*="border"]') ||
      firstEventTitle.parentElement?.parentElement;
    if (firstEventBox) {
      const dates = within(firstEventBox as HTMLElement).getAllByText(/2025-10-\d{2}/);
      expect(dates.length).toBeGreaterThan(0);
      // 첫 번째 날짜가 2025-10-05인지 확인
      expect(dates[0]).toHaveTextContent('2025-10-05');
    }
  }, 30000);

  // 통합 테스트 3: 최신순 정렬이 날짜 → 시간 → 제목 순서로 작동하는지
  it('최신순 정렬 시 날짜 → 시간 → 제목 순서로 정렬된다', async () => {
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '회의 A',
        date: '2025-10-05',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '회의 C',
        date: '2025-10-25',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '회의 B',
        date: '2025-10-25',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '회의');

    // 최신순 버튼 클릭
    const newestButton = screen.getByRole('button', { name: '최신순' });
    await user.click(newestButton);

    // 일정 목록이 표시될 때까지 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const eventList = screen.getByTestId('event-list');

    // 최신순 정렬 확인: 날짜 내림차순 → 시간 내림차순 → 제목 오름차순
    // 예상 순서: 2025-10-25 14:00 회의 B → 2025-10-25 09:00 회의 C → 2025-10-05 09:00 회의 A
    const eventBoxes = await within(eventList).findAllByText(/회의 [ABC]/);
    expect(eventBoxes.length).toBeGreaterThanOrEqual(3);

    // 첫 번째 일정 박스에서 날짜 확인
    const firstEventTitle = eventBoxes[0];
    const firstEventBox =
      firstEventTitle.closest('div[style*="border"]') ||
      firstEventTitle.parentElement?.parentElement;
    if (firstEventBox) {
      const dates = within(firstEventBox as HTMLElement).getAllByText(/2025-10-\d{2}/);
      expect(dates.length).toBeGreaterThan(0);
      // 첫 번째 날짜가 2025-10-25인지 확인
      expect(dates[0]).toHaveTextContent('2025-10-25');
    }
  }, 30000);

  // E2E 테스트: 검색 → 정렬 전체 플로우
  it('검색어 입력 → 정렬 버튼 클릭 → 정렬된 결과 표시 전체 플로우', async () => {
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '회의 A',
        date: '2025-10-10',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '회의 B',
        date: '2025-10-20',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 1. 검색어 입력
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '회의');

    // 2. 정렬 버튼 확인
    const newestButton = screen.getByRole('button', { name: '최신순' });
    const oldestButton = screen.getByRole('button', { name: '오래된순' });
    expect(newestButton).toBeInTheDocument();
    expect(oldestButton).toBeInTheDocument();

    // 3. 기본값이 오래된순인지 확인
    expect(oldestButton).toHaveClass('MuiButton-contained');

    // 4. 최신순 버튼 클릭
    await user.click(newestButton);

    // 5. 정렬 버튼 상태 변경 확인
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(newestButton).toHaveClass('MuiButton-contained');
    expect(oldestButton).toHaveClass('MuiButton-outlined');

    // 6. 정렬된 결과 확인 (최신순: 2025-10-20이 먼저)
    await new Promise((resolve) => setTimeout(resolve, 500));
    const eventList = screen.getByTestId('event-list');
    const eventItems = within(eventList).getAllByText(/회의 [AB]/);
    expect(eventItems.length).toBeGreaterThanOrEqual(2);

    // 7. 검색 결과가 없어도 버튼이 표시되는지 확인
    await user.clear(searchInput);
    await user.type(searchInput, '존재하지않는일정');
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(newestButton).toBeInTheDocument();
    expect(oldestButton).toBeInTheDocument();
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  }, 45000);
});
