import type { Meta, StoryObj } from '@storybook/react';

import WeekView from '../components/hw/WeekView';
import { Event } from '../types';

const meta: Meta = {
  title: 'Visual Regression Tests/2. 일정 상태별 시각적 표현',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const EventStatusVisualizationStory = () => {
  const currentDate = new Date('2025-10-27');
  const events: Event[] = [
    {
      id: '1',
      title: '일반 일정',
      date: '2025-10-27',
      startTime: '09:00',
      endTime: '10:00',
      description: '알림 없음, 반복 없음',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '알림 일정',
      date: '2025-10-28',
      startTime: '10:00',
      endTime: '11:00',
      description: '알림 있음',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
    {
      id: '3',
      title: '반복 일정 (일)',
      date: '2025-10-29',
      startTime: '11:00',
      endTime: '12:00',
      description: '매일 반복',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'daily', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '4',
      title: '반복 일정 (주)',
      date: '2025-10-30',
      startTime: '12:00',
      endTime: '13:00',
      description: '매주 반복',
      location: '회의실 D',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 15,
    },
    {
      id: '5',
      title: '반복 일정 (월)',
      date: '2025-10-31',
      startTime: '13:00',
      endTime: '14:00',
      description: '매월 반복',
      location: '회의실 E',
      category: '업무',
      repeat: { type: 'monthly', interval: 1 },
      notificationTime: 20,
    },
    {
      id: '6',
      title: '알림 + 반복',
      date: '2025-11-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '알림과 반복 모두 있음',
      location: '회의실 F',
      category: '업무',
      repeat: { type: 'weekly', interval: 2 },
      notificationTime: 30,
    },
  ];

  const notifiedEvents: string[] = ['2', '4', '6'];

  const handleEventDrop = () => {};
  const handleDateClick = () => {};
  const handleMoreEventsClick = () => {};

  return (
    <div style={{ padding: '20px' }}>
      <h3>Week View - 다양한 일정 상태</h3>
      <WeekView
        currentDate={currentDate}
        filteredEvents={events}
        notifiedEvents={notifiedEvents}
        onEventDrop={handleEventDrop}
        onDateClick={handleDateClick}
        onMoreEventsClick={handleMoreEventsClick}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <EventStatusVisualizationStory />,
};
