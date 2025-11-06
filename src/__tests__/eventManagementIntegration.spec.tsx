import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event, RepeatInfo } from '../types';

const theme = createTheme();

// ! Hard 여기 제공 안함
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

// ! Hard 여기 제공 안함
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'> & { repeat?: RepeatInfo }
) => {
  const { title, date, startTime, endTime, location, description, category, repeat } = form;

  // 버튼이 disabled 상태이므로 먼저 input 필드를 클릭해서 활성화
  await user.click(screen.getByLabelText('제목'));

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  if (repeat) {
    await user.click(screen.getByLabelText('반복 일정'));
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: `${repeat.type}-option` }));
    await user.clear(screen.getByLabelText('반복 간격'));
    await user.type(screen.getByLabelText('반복 간격'), String(repeat.interval));
    if (repeat.endDate) {
      await user.type(screen.getByLabelText('반복 종료일'), repeat.endDate!);
    }
  }

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('일정 관리 통합 테스트', () => {
  it('일반 일정을 다른 날짜로 드래그하면 날짜가 변경된다', async () => {
    setupMockHandlerCreation();

    // 이동 후 업데이트된 일정을 반환하도록 설정
    server.use(
      http.put('/api/events/:id', async ({ request }) => {
        const updatedEvent = (await request.json()) as Event;
        return HttpResponse.json(updatedEvent);
      })
    );

    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 일정 생성
    await saveSchedule(user, {
      title: '팀 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
    });

    // 일정 저장 완료 대기
    await screen.findByText('일정이 추가되었습니다', {}, { timeout: 5000 });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 월별 뷰에서 일정 확인
    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // 일정이 월별 뷰에 표시되는지 확인
    const monthViewContainer = within(monthView);
    const event = monthViewContainer.getByText('팀 회의');
    expect(event).toBeInTheDocument();

    // 일정 리스트에서도 확인
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
  }, 30000);
});
