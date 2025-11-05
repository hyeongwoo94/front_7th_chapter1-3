import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import MoreEventsModal from '../components/hw/MoreEventsModal';
import OverlapWarningDialog from '../components/hw/OverlapWarningDialog';
import { Event } from '../types';

const meta: Meta = {
  title: 'Visual Regression Tests/3. 다이얼로그 및 모달',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const DialogsAndModalsStory = () => {
  const [moreModalOpen, setMoreModalOpen] = useState(true);
  const [overlapDialogOpen, setOverlapDialogOpen] = useState(true);

  const events: Event[] = [
    {
      id: '1',
      title: '첫 번째 일정',
      date: '2025-10-27',
      startTime: '09:00',
      endTime: '10:00',
      description: '설명 1',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '두 번째 일정',
      date: '2025-10-27',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명 2',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '세 번째 일정',
      date: '2025-10-27',
      startTime: '11:00',
      endTime: '12:00',
      description: '설명 3',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const overlappingEvents: Event[] = [
    {
      id: 'overlap-1',
      title: '겹치는 일정 1',
      date: '2025-10-27',
      startTime: '09:30',
      endTime: '10:30',
      description: '겹침 설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const handleEventClick = (event: Event) => {
    console.log('Event clicked:', event);
    setMoreModalOpen(false);
  };

  const handleDeleteClick = (eventId: string) => {
    console.log('Delete clicked:', eventId);
  };

  const handleOverlapCancel = () => {
    console.log('Overlap cancelled');
    setOverlapDialogOpen(false);
  };

  const handleOverlapConfirm = () => {
    console.log('Overlap confirmed');
    setOverlapDialogOpen(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setMoreModalOpen(true)}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          더보기 모달 열기
        </button>
        <button onClick={() => setOverlapDialogOpen(true)} style={{ padding: '8px 16px' }}>
          겹침 경고 다이얼로그 열기
        </button>
      </div>

      <MoreEventsModal
        open={moreModalOpen}
        onClose={() => setMoreModalOpen(false)}
        events={events}
        selectedDate="2025-10-27"
        onEventClick={handleEventClick}
        onDeleteClick={handleDeleteClick}
      />

      <OverlapWarningDialog
        open={overlapDialogOpen}
        overlappingEvents={overlappingEvents}
        onCancel={handleOverlapCancel}
        onConfirm={handleOverlapConfirm}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <DialogsAndModalsStory />,
};
