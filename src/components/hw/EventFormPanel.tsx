import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Select,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Button,
} from '@mui/material';
import { useState, useEffect } from 'react';
import type React from 'react';

import { RepeatType } from '../../types.ts';
import { getTimeErrorMessage } from '../../utils/timeValidation.ts';

interface EventFormPanelProps {
  editingEvent: unknown | null;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  startTime: string;
  endTime: string;
  handleStartTimeChange: React.ChangeEventHandler<HTMLInputElement>;
  handleEndTimeChange: React.ChangeEventHandler<HTMLInputElement>;
  startTimeError: string | null;
  endTimeError: string | null;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  isRepeating: boolean;
  setIsRepeating: React.Dispatch<React.SetStateAction<boolean>>;
  repeatType: RepeatType;
  setRepeatType: React.Dispatch<React.SetStateAction<RepeatType>>;
  repeatInterval: number;
  setRepeatInterval: React.Dispatch<React.SetStateAction<number>>;
  repeatEndDate: string;
  setRepeatEndDate: React.Dispatch<React.SetStateAction<string>>;
  notificationTime: number;
  setNotificationTime: React.Dispatch<React.SetStateAction<number>>;
  notificationOptions: { value: number; label: string }[];
  categories: string[];
  onSubmit: () => void;
}

const EventFormPanel = ({
  editingEvent,
  title,
  setTitle,
  date,
  setDate,
  startTime,
  endTime,
  handleStartTimeChange,
  handleEndTimeChange,
  startTimeError,
  endTimeError,
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
  notificationOptions,
  categories,
  onSubmit,
}: EventFormPanelProps) => {
  const [isFormInteracted, setIsFormInteracted] = useState(false);

  // input 필드 클릭 시 버튼 활성화
  const handleInputFocus = () => {
    setIsFormInteracted(true);
  };

  // editingEvent가 변경되면 isFormInteracted 초기화
  useEffect(() => {
    setIsFormInteracted(false);
  }, [editingEvent]);

  return (
    <Stack spacing={2} sx={{ width: '20%' }}>
      <Typography variant="h4">{editingEvent ? '일정 수정' : '일정 추가'}</Typography>

      <FormControl fullWidth>
        <FormLabel htmlFor="title">제목</FormLabel>
        <TextField
          id="title"
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={handleInputFocus}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="date">날짜</FormLabel>
        <TextField
          id="date"
          size="small"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onFocus={handleInputFocus}
        />
      </FormControl>

      <Stack direction="row" spacing={2}>
        <FormControl fullWidth>
          <FormLabel htmlFor="start-time">시작 시간</FormLabel>
          <Tooltip title={startTimeError || ''} open={!!startTimeError} placement="top">
            <TextField
              id="start-time"
              size="small"
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              onFocus={handleInputFocus}
              error={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl fullWidth>
          <FormLabel htmlFor="end-time">종료 시간</FormLabel>
          <Tooltip title={endTimeError || ''} open={!!endTimeError} placement="top">
            <TextField
              id="end-time"
              size="small"
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              onFocus={handleInputFocus}
              error={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </Stack>

      <FormControl fullWidth>
        <FormLabel htmlFor="description">설명</FormLabel>
        <TextField
          id="description"
          size="small"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onFocus={handleInputFocus}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="location">위치</FormLabel>
        <TextField
          id="location"
          size="small"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onFocus={handleInputFocus}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel id="category-label">카테고리</FormLabel>
        <Select
          id="category"
          size="small"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          onFocus={handleInputFocus}
          aria-labelledby="category-label"
          aria-label="카테고리"
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat} aria-label={`${cat}-option`}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!editingEvent && (
        <FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={isRepeating}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsRepeating(checked);
                  if (checked) {
                    setRepeatType('daily');
                  } else {
                    setRepeatType('none');
                  }
                }}
              />
            }
            label="반복 일정"
          />
        </FormControl>
      )}

      {isRepeating && !editingEvent && (
        <Stack spacing={2}>
          <FormControl fullWidth>
            <FormLabel>반복 유형</FormLabel>
            <Select
              size="small"
              value={repeatType}
              aria-label="반복 유형"
              onChange={(e) => setRepeatType(e.target.value as RepeatType)}
              onOpen={handleInputFocus}
            >
              <MenuItem value="daily" aria-label="daily-option">
                매일
              </MenuItem>
              <MenuItem value="weekly" aria-label="weekly-option">
                매주
              </MenuItem>
              <MenuItem value="monthly" aria-label="monthly-option">
                매월
              </MenuItem>
              <MenuItem value="yearly" aria-label="yearly-option">
                매년
              </MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <FormLabel htmlFor="repeat-interval">반복 간격</FormLabel>
              <TextField
                id="repeat-interval"
                size="small"
                type="number"
                value={repeatInterval}
                onChange={(e) => setRepeatInterval(Number(e.target.value))}
                onFocus={handleInputFocus}
                slotProps={{ htmlInput: { min: 1 } }}
              />
            </FormControl>
            <FormControl fullWidth>
              <FormLabel htmlFor="repeat-end-date">반복 종료일</FormLabel>
              <TextField
                id="repeat-end-date"
                size="small"
                type="date"
                value={repeatEndDate}
                onChange={(e) => setRepeatEndDate(e.target.value)}
                onFocus={handleInputFocus}
              />
            </FormControl>
          </Stack>
        </Stack>
      )}

      <FormControl fullWidth>
        <FormLabel htmlFor="notification">알림 설정</FormLabel>
        <Select
          id="notification"
          size="small"
          value={notificationTime}
          onChange={(e) => setNotificationTime(Number(e.target.value))}
          onOpen={handleInputFocus}
        >
          {notificationOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        data-testid="event-submit-button"
        onClick={onSubmit}
        variant="contained"
        color="primary"
        disabled={!isFormInteracted}
      >
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </Stack>
  );
};

export default EventFormPanel;
