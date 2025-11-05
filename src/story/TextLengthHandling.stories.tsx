import type { Meta, StoryObj } from '@storybook/react';

import MonthView from '../components/hw/MonthView';
import WeekView from '../components/hw/WeekView';
import { Event } from '../types';

const meta: Meta = {
  title: 'Visual Regression Tests/5. 각 셀 텍스트 길이에 따른 처리',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// 공휴일 데이터
const sampleHolidays: Record<string, string> = {
  '2025-10-03': '개천절',
  '2025-10-09': '한글날',
};

export const Default: Story = {
  render: () => {
    const currentDate = new Date('2025-10-27');
    const events: Event[] = [
      {
        id: '1',
        title: '짧은 제목',
        date: '2025-10-27',
        startTime: '09:00',
        endTime: '10:00',
        description: '짧은 제목 테스트',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '중간 길이의 제목입니다. 이것은 적당한 길이의 제목입니다.',
        date: '2025-10-28',
        startTime: '10:00',
        endTime: '11:00',
        description: '중간 길이 제목',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title:
          '매우 긴 제목입니다. 이것은 캘린더 셀에 표시될 때 텍스트가 잘리는지 확인하기 위한 매우 긴 제목입니다. 이 제목은 여러 줄로 표시되거나 잘려야 합니다.',
        date: '2025-10-29',
        startTime: '11:00',
        endTime: '12:00',
        description: '긴 제목 테스트',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '4',
        title:
          '초장기 제목입니다. 이것은 정말로 매우 긴 제목이며 캘린더 셀의 레이아웃을 테스트하기 위한 것입니다. 이 제목은 여러 줄로 표시되거나 말줄임표(...)로 처리되어야 합니다. 또한 반복 일정 아이콘과 알림 아이콘이 함께 표시될 때도 제대로 작동해야 합니다.',
        date: '2025-10-30',
        startTime: '12:00',
        endTime: '13:00',
        description: '초장기 제목 테스트',
        location: '회의실 D',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 30,
      },
    ];

    const notifiedEvents: string[] = ['4'];

    const handleEventDrop = () => {};
    const handleDateClick = () => {};
    const handleMoreEventsClick = () => {};

    return (
      <div style={{ padding: '20px' }}>
        <h3>Week View - 텍스트 길이 처리</h3>
        <WeekView
          currentDate={currentDate}
          filteredEvents={events}
          notifiedEvents={notifiedEvents}
          onEventDrop={handleEventDrop}
          onDateClick={handleDateClick}
          onMoreEventsClick={handleMoreEventsClick}
        />
        <div style={{ marginTop: '40px' }}>
          <h3>Month View - 텍스트 길이 처리</h3>
          <MonthView
            currentDate={new Date('2025-10-01')}
            filteredEvents={events}
            notifiedEvents={notifiedEvents}
            holidays={sampleHolidays}
            onEventDrop={handleEventDrop}
            onDateClick={handleDateClick}
            onMoreEventsClick={handleMoreEventsClick}
          />
        </div>
      </div>
    );
  },
};
