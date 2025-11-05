import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Event } from '../types';
import WeekView from '../components/hw/WeekView';

const meta: Meta<typeof WeekView> = {
  title: 'Components/WeekView',
  component: WeekView,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WeekView>;

// 샘플 이벤트 데이터
const sampleEvents: Event[] = [
  {
    id: '1',
    title: '주간 회의',
    date: '2025-10-27',
    startTime: '09:00',
    endTime: '10:00',
    description: '주간 팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-10-28',
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
    date: '2025-10-29',
    startTime: '14:00',
    endTime: '15:00',
    description: '매주 반복',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 5,
  },
];

const DefaultStory = () => {
  const [currentDate] = useState(new Date('2025-10-27'));
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
    <WeekView
      currentDate={currentDate}
      filteredEvents={sampleEvents}
      notifiedEvents={notifiedEvents}
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
  const [currentDate] = useState(new Date('2025-10-27'));
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
    <WeekView
      currentDate={currentDate}
      filteredEvents={[]}
      notifiedEvents={notifiedEvents}
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
  const [currentDate] = useState(new Date('2025-10-27'));
  const notifiedEvents: string[] = ['1']; // 알림이 표시된 이벤트 ID

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
    <WeekView
      currentDate={currentDate}
      filteredEvents={sampleEvents}
      notifiedEvents={notifiedEvents}
      onEventDrop={handleEventDrop}
      onDateClick={handleDateClick}
      onMoreEventsClick={handleMoreEventsClick}
    />
  );
};

export const WithNotifications: Story = {
  render: () => <WithNotificationsStory />,
};

