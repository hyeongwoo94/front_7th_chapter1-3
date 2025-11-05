import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import MonthView from '../components/hw/MonthView';
import WeekView from '../components/hw/WeekView';
import { Event } from '../types';

const meta: Meta = {
  title: 'Visual Regression Tests/1. 타입에 따른 캘린더 뷰 렌더링',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// 샘플 이벤트 데이터
const createSampleEvents = (): Event[] => [
  {
    id: '1',
    title: '짧은 제목',
    date: '2025-10-27',
    startTime: '09:00',
    endTime: '10:00',
    description: '일반 일정',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title:
      '매우 긴 제목입니다. 이것은 캘린더 셀에 표시될 때 텍스트가 잘리는지 확인하기 위한 매우 긴 제목입니다.',
    date: '2025-10-28',
    startTime: '12:00',
    endTime: '13:00',
    description: '긴 제목 테스트',
    location: '식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '3',
    title: '반복 일정',
    date: '2025-10-29',
    startTime: '14:00',
    endTime: '15:00',
    description: '매주 반복',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 5,
  },
  {
    id: '4',
    title: '알림 일정',
    date: '2025-10-30',
    startTime: '16:00',
    endTime: '17:00',
    description: '알림이 있는 일정',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
];

// 공휴일 데이터
const sampleHolidays: Record<string, string> = {
  '2025-10-03': '개천절',
  '2025-10-09': '한글날',
};

const CalendarViewTypesStory = () => {
  const [viewType, setViewType] = useState<'week' | 'month'>('week');
  const currentDate = new Date('2025-10-27');
  const events = createSampleEvents();
  const notifiedEvents: string[] = ['4'];

  const handleEventDrop = (event: Event, newDate: Date) => {
    console.log('Event dropped:', event.title, 'to', newDate);
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
  };

  const handleMoreEventsClick = (date: string) => {
    console.log('More events clicked for date:', date);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setViewType('week')}
          style={{
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: viewType === 'week' ? '#1976d2' : '#e0e0e0',
            color: viewType === 'week' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Week View
        </button>
        <button
          onClick={() => setViewType('month')}
          style={{
            padding: '8px 16px',
            backgroundColor: viewType === 'month' ? '#1976d2' : '#e0e0e0',
            color: viewType === 'month' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Month View
        </button>
      </div>
      {viewType === 'week' ? (
        <WeekView
          currentDate={currentDate}
          filteredEvents={events}
          notifiedEvents={notifiedEvents}
          onEventDrop={handleEventDrop}
          onDateClick={handleDateClick}
          onMoreEventsClick={handleMoreEventsClick}
        />
      ) : (
        <MonthView
          currentDate={new Date('2025-10-01')}
          filteredEvents={events}
          notifiedEvents={notifiedEvents}
          holidays={sampleHolidays}
          onEventDrop={handleEventDrop}
          onDateClick={handleDateClick}
          onMoreEventsClick={handleMoreEventsClick}
        />
      )}
    </div>
  );
};

export const Default: Story = {
  render: () => <CalendarViewTypesStory />,
};
