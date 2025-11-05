import { Box, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import EventFormPanel from './components/hw/EventFormPanel.tsx';
import EventListPanel from './components/hw/EventListPanel.tsx';
import MonthView from './components/hw/MonthView.tsx';
import MoreEventsModal from './components/hw/MoreEventsModal.tsx';
import NotificationsStack from './components/hw/NotificationsStack.tsx';
import OverlapWarningDialog from './components/hw/OverlapWarningDialog.tsx';
import ViewToolbar from './components/hw/ViewToolbar.tsx';
import WeekView from './components/hw/WeekView.tsx';
import RecurringEventDialog from './components/RecurringEventDialog.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useRecurringEventOperations } from './hooks/useRecurringEventOperations.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm } from './types.ts';
import { findOverlappingEvents } from './utils/eventOverlap.ts';

const categories = ['업무', '개인', '가족', '기타'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

function App() {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  } = useEventForm();

  const { events, saveEvent, deleteEvent, createRepeatEvent, fetchEvents } = useEventOperations(
    Boolean(editingEvent),
    () => setEditingEvent(null)
  );

  const { handleRecurringEdit, handleRecurringDelete } = useRecurringEventOperations(
    events,
    async () => {
      // After recurring edit, refresh events from server
      await fetchEvents();
    }
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [pendingOverlapSave, setPendingOverlapSave] = useState<Event | EventForm | null>(null);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [pendingRecurringEdit, setPendingRecurringEdit] = useState<Event | null>(null);
  const [pendingRecurringDelete, setPendingRecurringDelete] = useState<Event | null>(null);
  const [recurringEditMode, setRecurringEditMode] = useState<boolean | null>(null); // true = single, false = all
  const [recurringDialogMode, setRecurringDialogMode] = useState<'edit' | 'delete'>('edit');
  const [isMoreEventsModalOpen, setIsMoreEventsModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<string>('');

  const { enqueueSnackbar } = useSnackbar();

  const handleRecurringConfirm = async (editSingleOnly: boolean) => {
    if (recurringDialogMode === 'edit' && pendingRecurringEdit) {
      // 편집 모드 저장하고 편집 폼으로 이동
      setRecurringEditMode(editSingleOnly);
      editEvent(pendingRecurringEdit);
      setIsRecurringDialogOpen(false);
      setPendingRecurringEdit(null);
    } else if (recurringDialogMode === 'delete' && pendingRecurringDelete) {
      // 반복 일정 삭제 처리
      try {
        await handleRecurringDelete(pendingRecurringDelete, editSingleOnly);
        enqueueSnackbar('일정이 삭제되었습니다', { variant: 'success' });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
      }
      setIsRecurringDialogOpen(false);
      setPendingRecurringDelete(null);
    }
  };

  const isRecurringEvent = (event: Event): boolean => {
    return event.repeat.type !== 'none' && event.repeat.interval > 0;
  };

  const handleEditEvent = (event: Event) => {
    if (isRecurringEvent(event)) {
      // Show recurring edit dialog
      setPendingRecurringEdit(event);
      setRecurringDialogMode('edit');
      setIsRecurringDialogOpen(true);
    } else {
      // Regular event editing
      editEvent(event);
    }
  };

  const handleDeleteEvent = (event: Event) => {
    if (isRecurringEvent(event)) {
      // Show recurring delete dialog
      setPendingRecurringDelete(event);
      setRecurringDialogMode('delete');
      setIsRecurringDialogOpen(true);
    } else {
      // Regular event deletion
      deleteEvent(event.id);
    }
  };

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleEventDrop = async (event: Event, newDate: Date) => {
    const newDateString = formatDateToString(newDate);
    const isRecurring = event.repeat.type !== 'none' && event.repeat.interval > 0;

    const updatedEvent: Event = {
      ...event,
      date: newDateString,
      // 반복 일정을 드래그하면 단일 일정으로 변환
      repeat: isRecurring
        ? {
            type: 'none',
            interval: 0,
          }
        : event.repeat,
    };

    // 일반 일정으로 풀린 경우 (반복 일정이 단일 일정으로 변환된 경우) 겹침 알림 없이 바로 저장
    if (isRecurring) {
      await saveEvent(updatedEvent);
      enqueueSnackbar('일정이 이동되었습니다', { variant: 'success' });
      return;
    }

    // 기존 일반 일정인 경우에만 겹침 검사
    const overlapping = findOverlappingEvents(
      updatedEvent,
      events.filter((e) => e.id !== event.id)
    );
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
      // 겹침 다이얼로그에서 확인하면 저장되도록 설정
      setEditingEvent(updatedEvent);
      setPendingOverlapSave(updatedEvent);
      return;
    }

    // 일정 업데이트 (updatedEvent에 id가 있으므로 saveEvent가 자동으로 업데이트 모드로 처리함)
    await saveEvent(updatedEvent);
    enqueueSnackbar('일정이 이동되었습니다', { variant: 'success' });
  };

  const handleDateClick = (date: Date) => {
    // 해당 날짜에 일정이 있는지 확인
    const dateString = formatDateToString(date);
    const hasEventsOnDate = filteredEvents.some(
      (event) => new Date(event.date).toDateString() === date.toDateString()
    );

    // 일정이 없는 경우에만 폼에 날짜 채우기
    if (!hasEventsOnDate) {
      resetForm();
      setDate(dateString);
      setEditingEvent(null);
    }
  };

  const handleMoreEventsClick = (date: string) => {
    setSelectedDateForModal(date);
    setIsMoreEventsModalOpen(true);
  };

  const handleModalEventClick = (event: Event) => {
    // 모달에서 일정 클릭 시 수정 화면으로 이동 (오른쪽 리스트의 수정 아이콘 클릭과 동일한 동작)
    handleEditEvent(event);
  };

  const handleModalDeleteClick = async (eventId: string) => {
    // 모달에서 삭제 버튼 클릭 시 즉시 삭제 (확인 없이)
    const eventToDelete = events.find((e) => e.id === eventId);
    if (eventToDelete) {
      handleDeleteEvent(eventToDelete);
    }
  };

  // 모달에 표시할 일정 필터링 (선택한 날짜의 일정만)
  const getEventsForModal = (): Event[] => {
    if (!selectedDateForModal) return [];
    return filteredEvents.filter((event) => {
      // event.date와 selectedDateForModal은 모두 YYYY-MM-DD 형식이므로 직접 비교
      return event.date === selectedDateForModal;
    });
  };

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: editingEvent
        ? editingEvent.repeat // Keep original repeat settings for recurring event detection
        : {
            type: isRepeating ? repeatType : 'none',
            interval: repeatInterval,
            endDate: repeatEndDate || undefined,
          },
      notificationTime,
    };

    // 수정
    if (editingEvent) {
      // 반복 일정 단일 편집인 경우에도 겹침 검사 필요
      const isSingleRecurringEdit =
        editingEvent.repeat.type !== 'none' &&
        editingEvent.repeat.interval > 0 &&
        recurringEditMode === true;

      // 일반 일정으로 풀린 경우 (단일 편집된 반복 일정) 겹침 알림 없이 바로 저장
      if (isSingleRecurringEdit) {
        if (
          editingEvent.repeat.type !== 'none' &&
          editingEvent.repeat.interval > 0 &&
          recurringEditMode !== null
        ) {
          await handleRecurringEdit(
            {
              ...eventData,
              repeat: { type: 'none', interval: 0 },
            } as Event,
            recurringEditMode
          );
          setRecurringEditMode(null);
        } else {
          await saveEvent({
            ...eventData,
            repeat: { type: 'none', interval: 0 },
          } as Event);
        }
        resetForm();
        return;
      }

      // 기존 일반 일정이거나 반복 일정 전체 편집인 경우에만 겹침 검사
      const overlapping = findOverlappingEvents(eventData, events);
      const hasOverlapEvent = overlapping.length > 0;

      if (hasOverlapEvent) {
        setOverlappingEvents(overlapping);
        setIsOverlapDialogOpen(true);
        setPendingOverlapSave(eventData);
        return;
      }

      if (
        editingEvent.repeat.type !== 'none' &&
        editingEvent.repeat.interval > 0 &&
        recurringEditMode !== null
      ) {
        await handleRecurringEdit(eventData as Event, recurringEditMode);
        setRecurringEditMode(null);
      } else {
        await saveEvent(eventData);
      }

      resetForm();
      return;
    }

    // 생성
    const overlapping = findOverlappingEvents(eventData, events);
    const hasOverlapEvent = overlapping.length > 0;

    if (isRepeating) {
      // 반복 생성은 반복 일정을 고려하지 않는다.
      await createRepeatEvent(eventData);
      resetForm();
      return;
    }

    if (hasOverlapEvent) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
      setPendingOverlapSave(eventData);
      return;
    }

    await saveEvent(eventData);
    resetForm();
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        <EventFormPanel
          editingEvent={editingEvent}
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
          onSubmit={addOrUpdateEvent}
        />

        <Stack flex={1} spacing={5}>
          <Typography variant="h4">일정 보기</Typography>
          <ViewToolbar view={view} setView={setView} navigate={navigate} />
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              notifiedEvents={notifiedEvents}
              onEventDrop={handleEventDrop}
              onDateClick={handleDateClick}
              onMoreEventsClick={handleMoreEventsClick}
            />
          )}
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              notifiedEvents={notifiedEvents}
              holidays={holidays}
              onEventDrop={handleEventDrop}
              onDateClick={handleDateClick}
              onMoreEventsClick={handleMoreEventsClick}
            />
          )}
        </Stack>
        <Stack spacing={2} sx={{ width: '30%', height: '100%' }}>
          <Typography variant="h6">일정 검색</Typography>
          <Box>
            <input
              id="search"
              aria-label="검색어를 입력하세요"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </Box>
          <EventListPanel
            filteredEvents={filteredEvents}
            notifiedEvents={notifiedEvents}
            notificationOptions={notificationOptions}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        </Stack>
      </Stack>

      <OverlapWarningDialog
        open={isOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        onCancel={() => {
          setIsOverlapDialogOpen(false);
          setPendingOverlapSave(null);
          setRecurringEditMode(null);
        }}
        onConfirm={async () => {
          setIsOverlapDialogOpen(false);
          if (pendingOverlapSave) {
            // 겹침 확인 시, 직전에 계산된 동일 객체를 저장하여 소실/덮어쓰기 방지
            await saveEvent(pendingOverlapSave);
            setPendingOverlapSave(null);
            // 단일 편집 모드였다면 초기화
            if (recurringEditMode === true) {
              setRecurringEditMode(null);
              resetForm();
            }
          }
        }}
      />

      <RecurringEventDialog
        open={isRecurringDialogOpen}
        onClose={() => {
          setIsRecurringDialogOpen(false);
          setPendingRecurringEdit(null);
          setPendingRecurringDelete(null);
        }}
        onConfirm={handleRecurringConfirm}
        event={recurringDialogMode === 'edit' ? pendingRecurringEdit : pendingRecurringDelete}
        mode={recurringDialogMode}
      />

      <MoreEventsModal
        open={isMoreEventsModalOpen}
        onClose={() => {
          setIsMoreEventsModalOpen(false);
          setSelectedDateForModal('');
        }}
        events={getEventsForModal()}
        selectedDate={selectedDateForModal}
        onEventClick={handleModalEventClick}
        onDeleteClick={handleModalDeleteClick}
      />

      <NotificationsStack
        notifications={notifications}
        onClose={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
      />
    </Box>
  );
}

export default App;
