import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Event } from '../types';
import EventFormPanel from '../components/hw/EventFormPanel';
import MonthView from '../components/hw/MonthView';
import MoreEventsModal from '../components/hw/MoreEventsModal';
import OverlapWarningDialog from '../components/hw/OverlapWarningDialog';
import WeekView from '../components/hw/WeekView';

const meta: Meta = {
  title: 'Visual Regression Tests',
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
    title: '매우 긴 제목입니다. 이것은 캘린더 셀에 표시될 때 텍스트가 잘리는지 확인하기 위한 매우 긴 제목입니다.',
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

// ============================================
// 1. 타입에 따른 캘린더 뷰 렌더링
// ============================================
export const CalendarViewTypes: Story = {
  render: () => {
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
  },
};

// ============================================
// 2. 일정 상태별 시각적 표현
// ============================================
export const EventStatusVisualization: Story = {
  render: () => {
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
  },
};

// ============================================
// 3. 다이얼로그 및 모달
// ============================================
export const DialogsAndModals: Story = {
  render: () => {
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
  },
};

// ============================================
// 4. 폼 컨트롤 상태
// ============================================
export const FormControlStates: Story = {
  render: () => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('2025-10-27');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [startTimeError, setStartTimeError] = useState<string | null>(null);
    const [endTimeError, setEndTimeError] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('업무');
    const [isRepeating, setIsRepeating] = useState(false);
    const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('none');
    const [repeatInterval, setRepeatInterval] = useState(1);
    const [repeatEndDate, setRepeatEndDate] = useState('');
    const [notificationTime, setNotificationTime] = useState(10);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    const notificationOptions = [
      { value: 0, label: '알림 없음' },
      { value: 5, label: '5분 전' },
      { value: 10, label: '10분 전' },
      { value: 15, label: '15분 전' },
      { value: 30, label: '30분 전' },
      { value: 60, label: '1시간 전' },
    ];

    const categories = ['업무', '개인', '건강', '취미'];

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newStartTime = e.target.value;
      setStartTime(newStartTime);
      if (newStartTime && endTime && newStartTime >= endTime) {
        setStartTimeError('시작 시간이 종료 시간보다 늦을 수 없습니다.');
      } else {
        setStartTimeError(null);
      }
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEndTime = e.target.value;
      setEndTime(newEndTime);
      if (startTime && newEndTime && startTime >= newEndTime) {
        setEndTimeError('종료 시간이 시작 시간보다 빠를 수 없습니다.');
      } else {
        setEndTimeError(null);
      }
    };

    const handleSubmit = () => {
      console.log('Form submitted');
    };

    const sampleEvent: Event = {
      id: 'edit-1',
      title: '수정할 일정',
      date: '2025-10-27',
      startTime: '14:00',
      endTime: '15:00',
      description: '이것은 수정 중인 일정입니다',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 15,
    };

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setEditingEvent(editingEvent ? null : sampleEvent)}
            style={{ marginRight: '10px', padding: '8px 16px' }}
          >
            {editingEvent ? '추가 모드로 전환' : '수정 모드로 전환'}
          </button>
          <button
            onClick={() => setStartTimeError('시작 시간 오류 예시')}
            style={{ marginRight: '10px', padding: '8px 16px' }}
          >
            시작 시간 오류 표시
          </button>
          <button onClick={() => setEndTimeError('종료 시간 오류 예시')} style={{ padding: '8px 16px' }}>
            종료 시간 오류 표시
          </button>
        </div>

        <EventFormPanel
          editingEvent={editingEvent as Event | null}
          title={title}
          setTitle={setTitle}
          date={date}
          setDate={setDate}
          startTime={startTime}
          endTime={endTime}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
          startTimeError={startTimeError}
          endTimeError={endTimeError}
          description={description}
          setDescription={setDescription}
          location={location}
          setLocation={setLocation}
          category={category}
          setCategory={setCategory}
          isRepeating={isRepeating}
          setIsRepeating={setIsRepeating}
          repeatType={repeatType}
          setRepeatType={setRepeatType}
          repeatInterval={repeatInterval}
          setRepeatInterval={setRepeatInterval}
          repeatEndDate={repeatEndDate}
          setRepeatEndDate={setRepeatEndDate}
          notificationTime={notificationTime}
          setNotificationTime={setNotificationTime}
          notificationOptions={notificationOptions}
          categories={categories}
          onSubmit={handleSubmit}
        />
      </div>
    );
  },
};

// ============================================
// 5. 각 셀 텍스트 길이에 따른 처리
// ============================================
export const TextLengthHandling: Story = {
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
        title: '매우 긴 제목입니다. 이것은 캘린더 셀에 표시될 때 텍스트가 잘리는지 확인하기 위한 매우 긴 제목입니다. 이 제목은 여러 줄로 표시되거나 잘려야 합니다.',
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
        title: '초장기 제목입니다. 이것은 정말로 매우 긴 제목이며 캘린더 셀의 레이아웃을 테스트하기 위한 것입니다. 이 제목은 여러 줄로 표시되거나 말줄임표(...)로 처리되어야 합니다. 또한 반복 일정 아이콘과 알림 아이콘이 함께 표시될 때도 제대로 작동해야 합니다.',
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

