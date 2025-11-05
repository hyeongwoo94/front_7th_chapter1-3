import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import MonthView from '../components/hw/MonthView';
import { Event } from '../types';

const meta: Meta<typeof MonthView> = {
  title: 'Components/MonthView',
  component: MonthView,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MonthView>;

// 샘플 이벤트 데이터
const sampleEvents: Event[] = [
  {
    id: '1',
    title: '월간 회의',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '월간 팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-10-16',
    startTime: '12:00',
    endTime: '13:00',
    description: '점심 식사',
    location: '식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '3',
    title: '반복 일정',
    date: '2025-10-17',
    startTime: '14:00',
    endTime: '15:00',
    description: '매일 반복',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'daily', interval: 1 },
    notificationTime: 5,
  },
  {
    id: '4',
    title: '프로젝트 미팅',
    date: '2025-10-20',
    startTime: '15:00',
    endTime: '16:00',
    description: '프로젝트 진행 상황 논의',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  },
  {
    id: '5',
    title: '팀 빌딩',
    date: '2025-10-25',
    startTime: '18:00',
    endTime: '20:00',
    description: '팀 빌딩 활동',
    location: '외부',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
];

// 샘플 공휴일 데이터
const sampleHolidays: Record<string, string> = {
  '2025-10-03': '개천절',
  '2025-10-09': '한글날',
};

const DefaultStory = () => {
  const [currentDate] = useState(new Date('2025-10-01'));
  const notifiedEvents: string[] = [];

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
    <MonthView
      currentDate={currentDate}
      filteredEvents={sampleEvents}
      notifiedEvents={notifiedEvents}
      holidays={sampleHolidays}
      onEventDrop={handleEventDrop}
      onDateClick={handleDateClick}
      onMoreEventsClick={handleMoreEventsClick}
    />
  );
};

export const Default: Story = {
  render: () => <DefaultStory />,
};

const EmptyStory = () => {
  const [currentDate] = useState(new Date('2025-10-01'));
  const notifiedEvents: string[] = [];

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
    <MonthView
      currentDate={currentDate}
      filteredEvents={[]}
      notifiedEvents={notifiedEvents}
      holidays={sampleHolidays}
      onEventDrop={handleEventDrop}
      onDateClick={handleDateClick}
      onMoreEventsClick={handleMoreEventsClick}
    />
  );
};

export const Empty: Story = {
  render: () => <EmptyStory />,
};

const WithNotificationsStory = () => {
  const [currentDate] = useState(new Date('2025-10-01'));
  const notifiedEvents: string[] = ['1', '4']; // 알림이 표시된 이벤트 ID

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
    <MonthView
      currentDate={currentDate}
      filteredEvents={sampleEvents}
      notifiedEvents={notifiedEvents}
      holidays={sampleHolidays}
      onEventDrop={handleEventDrop}
      onDateClick={handleDateClick}
      onMoreEventsClick={handleMoreEventsClick}
    />
  );
};

export const WithNotifications: Story = {
  render: () => <WithNotificationsStory />,
};

const WithManyEventsStory = () => {
  const [currentDate] = useState(new Date('2025-10-01'));
  const notifiedEvents: string[] = [];

  // 많은 이벤트 생성 (더보기 버튼 테스트용)
  const manyEvents: Event[] = Array.from({ length: 20 }, (_, i) => ({
    id: `many-${i}`,
    title: `일정 ${i + 1}`,
    date: `2025-10-${15 + (i % 5)}`,
    startTime: `${9 + (i % 8)}:00`,
    endTime: `${10 + (i % 8)}:00`,
    description: `설명 ${i + 1}`,
    location: '회의실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  }));

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
    <MonthView
      currentDate={currentDate}
      filteredEvents={manyEvents}
      notifiedEvents={notifiedEvents}
      holidays={sampleHolidays}
      onEventDrop={handleEventDrop}
      onDateClick={handleDateClick}
      onMoreEventsClick={handleMoreEventsClick}
    />
  );
};

export const WithManyEvents: Story = {
  render: () => <WithManyEventsStory />,
};
