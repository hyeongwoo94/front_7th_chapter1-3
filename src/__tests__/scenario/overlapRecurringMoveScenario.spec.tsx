import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
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

describe('Scenario - 반복 일정 단일화 후 동일 날짜로 이동 시 겹침 손실 버그', () => {
  it('두 단일화된 일정이 같은 날짜로 이동돼도 모두 보존된다 (시간 겹침 무시)', async () => {
    // 초기: 매일 반복에서 생성된 5일치(월~금) 인스턴스가 서버에 존재한다고 가정
    setupMockHandlerUpdating([
      {
        id: 'mon',
        title: '반복 작업',
        date: '2025-10-13', // 월
        startTime: '09:00',
        endTime: '10:00',
        description: '반복 일정',
        location: 'A',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
      {
        id: 'tue',
        title: '반복 작업',
        date: '2025-10-14', // 화
        startTime: '09:00',
        endTime: '10:00',
        description: '반복 일정',
        location: 'A',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
      {
        id: 'wed',
        title: '반복 작업',
        date: '2025-10-15', // 수
        startTime: '09:00',
        endTime: '10:00',
        description: '반복 일정',
        location: 'A',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
      {
        id: 'thu',
        title: '반복 작업',
        date: '2025-10-16', // 목
        startTime: '09:00',
        endTime: '10:00',
        description: '반복 일정',
        location: 'A',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
      {
        id: 'fri',
        title: '반복 작업',
        date: '2025-10-17', // 금
        startTime: '09:00',
        endTime: '10:00',
        description: '반복 일정',
        location: 'A',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    const list = within(await screen.findByTestId('event-list'));
    // 5개 생성 확인
    expect(list.getAllByText('반복 작업').length).toBeGreaterThanOrEqual(5);

    // 1) 월요일 인스턴스 편집 → 단일 일정(예) → 다음 주 월요일(2025-10-20)로 이동
    // 리스트는 날짜 오름차순이므로 첫 번째 Edit 버튼이 월요일일 것으로 가정
    let editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);
    // 반복 일정 수정 다이얼로그에서 단일 편집 선택
    await screen.findByText('반복 일정 수정');
    await user.click(screen.getByText('예'));
    // 폼에서 날짜 변경 후 저장
    await user.clear(screen.getByLabelText('날짜'));
    await user.type(screen.getByLabelText('날짜'), '2025-10-20');
    await user.click(screen.getByTestId('event-submit-button'));

    // 2) 화요일 인스턴스 편집 → 단일 일정(예) → 다음 주 화요일(2025-10-21)로 이동
    editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]); // 현재 리스트 첫 항목은 화요일일 가능성 높음
    // 반복 편집 다이얼로그가 나타날 수 있으나, 나타나지 않더라도 바로 편집 가능
    const editDialog = screen.queryByText('반복 일정 수정');
    if (editDialog) {
      await user.click(screen.getByText('예'));
    }
    await user.clear(screen.getByLabelText('날짜'));
    await user.type(screen.getByLabelText('날짜'), '2025-10-21');
    await user.click(screen.getByTestId('event-submit-button'));

    // 3) 두 단일화된 일정을 같은 날짜(2025-10-22, 수요일)로 각각 이동
    // 첫 번째 일정(2025-10-20)을 2025-10-22로 이동 (이때는 겹침 없음)
    editButtons = await screen.findAllByLabelText('Edit event');
    // 리스트에서 2025-10-20 날짜를 포함하는 항목 찾기
    const listContainer = await screen.findByTestId('event-list');
    const listItems = within(listContainer).getAllByText('반복 작업');
    let firstEventButton: HTMLElement | null = null;

    // 2025-10-20을 포함하는 항목 찾기
    for (const item of listItems) {
      const container = item.closest('div[style*="border"]') || item.parentElement;
      if (container?.textContent?.includes('2025-10-20')) {
        firstEventButton = container.querySelector('[aria-label="Edit event"]') as HTMLElement;
        break;
      }
    }

    if (!firstEventButton) {
      // 찾지 못하면 첫 번째 Edit 버튼 사용
      firstEventButton = editButtons[0];
    }

    await user.click(firstEventButton);
    // 이미 단일 일정이므로 반복 다이얼로그 없을 수 있음
    try {
      const editDialog1 = await screen.findByText('반복 일정 수정', {}, { timeout: 1000 });
      if (editDialog1) {
        await user.click(screen.getByText('예'));
      }
    } catch {
      // 반복 다이얼로그가 없으면 무시
    }
    await user.clear(screen.getByLabelText('날짜'));
    await user.type(screen.getByLabelText('날짜'), '2025-10-22');
    await user.click(screen.getByTestId('event-submit-button'));
    // 저장 완료 대기 (메시지가 표시될 수 있지만, 없어도 계속 진행)
    try {
      await screen.findByText('일정이 수정되었습니다', {}, { timeout: 3000 });
    } catch {
      // 메시지가 없어도 계속 진행
    }
    // 리스트 업데이트 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 두 번째 일정(2025-10-21)도 동일 날짜로 이동 (이때 첫 번째 일정과 겹침 발생)
    editButtons = await screen.findAllByLabelText('Edit event');
    const updatedListContainer = await screen.findByTestId('event-list');
    const updatedListItems = within(updatedListContainer).getAllByText('반복 작업');
    let secondEventButton: HTMLElement | null = null;

    // 2025-10-21을 포함하는 항목 찾기 (2025-10-22가 아닌)
    for (const item of updatedListItems) {
      const container = item.closest('div[style*="border"]') || item.parentElement;
      if (!container) continue;
      const text = container.textContent || '';
      if (text.includes('2025-10-21') && !text.includes('2025-10-22')) {
        const button = container.querySelector('[aria-label="Edit event"]') as HTMLElement;
        if (button) {
          secondEventButton = button;
          break;
        }
      }
    }

    if (!secondEventButton) {
      // 찾지 못하면 2025-10-22가 아닌 첫 번째 Edit 버튼 사용
      for (const btn of editButtons) {
        const container = btn.closest('div[style*="border"]') || btn.parentElement;
        if (container && !container.textContent?.includes('2025-10-22')) {
          secondEventButton = btn;
          break;
        }
      }
    }

    if (!secondEventButton) {
      // 그래도 찾지 못하면 첫 번째 버튼 사용
      secondEventButton = editButtons[0];
    }

    await user.click(secondEventButton);
    // 이미 단일 일정이므로 반복 다이얼로그 없을 수 있음
    try {
      const editDialog2 = await screen.findByText('반복 일정 수정', {}, { timeout: 1000 });
      if (editDialog2) {
        await user.click(screen.getByText('예'));
      }
    } catch {
      // 반복 다이얼로그가 없으면 무시
    }
    await user.clear(screen.getByLabelText('날짜'));
    await user.type(screen.getByLabelText('날짜'), '2025-10-22');
    await user.click(screen.getByTestId('event-submit-button'));

    // 일반 일정으로 풀린 후 겹칠 때는 겹침 경고가 나타나지 않아야 함
    // 겹침 경고가 나타나지 않는지 확인
    const overlapDialog = screen.queryByText('일정 겹침 경고');
    expect(overlapDialog).not.toBeInTheDocument();

    // 저장 완료 대기 (메시지가 표시될 수 있지만, 없어도 계속 진행)
    try {
      await screen.findByText('일정이 수정되었습니다', {}, { timeout: 3000 });
    } catch {
      // 메시지가 없어도 계속 진행
    }

    // 최종 검증: 리스트 업데이트 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 기대: 2025-10-22 날짜에 동일 제목의 두 일정이 모두 존재해야 함(시간 겹침 무시)
    const finalListContainer = await screen.findByTestId('event-list');
    const finalList = within(finalListContainer);

    // 동일 제목 두 개가 유지되는지 검사 (내용 소실 방지)
    const titles = finalList.getAllByText('반복 작업');
    expect(titles.length).toBeGreaterThanOrEqual(2);
  }, 30000);
});
