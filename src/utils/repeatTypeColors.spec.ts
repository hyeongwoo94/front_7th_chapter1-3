import { describe, expect, it } from 'vitest';

import { RepeatType } from '../types';
import { getRepeatBackgroundColor } from './repeatTypeColors.ts';

describe('getRepeatBackgroundColor', () => {
  describe('알림 우선순위', () => {
    it('알림된 일정은 반복 타입과 상관없이 빨간색을 반환해야 함', () => {
      // Given: 알림된 일정
      const isNotified = true;

      // When & Then: 모든 반복 타입에 대해 빨간색 반환
      expect(getRepeatBackgroundColor('daily', isNotified)).toBe('#ffebee');
      expect(getRepeatBackgroundColor('weekly', isNotified)).toBe('#ffebee');
      expect(getRepeatBackgroundColor('monthly', isNotified)).toBe('#ffebee');
      expect(getRepeatBackgroundColor('yearly', isNotified)).toBe('#ffebee');
      expect(getRepeatBackgroundColor('none', isNotified)).toBe('#ffebee');
    });
  });

  describe('반복 타입별 색상', () => {
    it('매일 반복 일정은 파란색을 반환해야 함', () => {
      // Given: 매일 반복 일정
      const repeatType: RepeatType = 'daily';
      const isNotified = false;

      // When
      const result = getRepeatBackgroundColor(repeatType, isNotified);

      // Then
      expect(result).toBe('#e3f2fd');
    });

    it('매주 반복 일정은 보라색을 반환해야 함', () => {
      // Given: 매주 반복 일정
      const repeatType: RepeatType = 'weekly';
      const isNotified = false;

      // When
      const result = getRepeatBackgroundColor(repeatType, isNotified);

      // Then
      expect(result).toBe('#f3e5f5');
    });

    it('매달 반복 일정은 주황색을 반환해야 함', () => {
      // Given: 매달 반복 일정
      const repeatType: RepeatType = 'monthly';
      const isNotified = false;

      // When
      const result = getRepeatBackgroundColor(repeatType, isNotified);

      // Then
      expect(result).toBe('#fff3e0');
    });

    it('매년 반복 일정은 녹색을 반환해야 함', () => {
      // Given: 매년 반복 일정
      const repeatType: RepeatType = 'yearly';
      const isNotified = false;

      // When
      const result = getRepeatBackgroundColor(repeatType, isNotified);

      // Then
      expect(result).toBe('#e8f5e9');
    });

    it('반복 없는 일정은 회색을 반환해야 함', () => {
      // Given: 반복 없는 일정
      const repeatType: RepeatType = 'none';
      const isNotified = false;

      // When
      const result = getRepeatBackgroundColor(repeatType, isNotified);

      // Then
      expect(result).toBe('#f5f5f5');
    });
  });
});
