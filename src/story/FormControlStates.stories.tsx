import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

import EventFormPanel from '../components/hw/EventFormPanel';
import { Event } from '../types';

const meta: Meta = {
  title: 'Visual Regression Tests/4. 폼 컨트롤 상태',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const FormControlStatesStory = () => {
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
  const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'>(
    'none'
  );
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
        <button
          onClick={() => setEndTimeError('종료 시간 오류 예시')}
          style={{ padding: '8px 16px' }}
        >
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
};

export const Default: Story = {
  render: () => <FormControlStatesStory />,
};
