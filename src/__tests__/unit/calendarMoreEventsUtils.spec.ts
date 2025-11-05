import { describe, expect, it } from 'vitest';

import { Event } from '../../types';
import { shouldShowMoreButton } from '../../utils/calendarMoreEventsUtils';

describe('calendarMoreEventsUtils >', () => {
  describe('shouldShowMoreButton >', () => {
    it('일정이 3개 이상일 때 true를 반환하고, 2개 이하일 때 false를 반환한다', () => {
      const events3: Event[] = [
        {
          id: '1',
          title: '회의 A',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '회의 B',
          date: '2025-10-15',
          startTime: '14:00',
          endTime: '15:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '3',
          title: '회의 C',
          date: '2025-10-15',
          startTime: '16:00',
          endTime: '17:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ];

      const events2: Event[] = [
        {
          id: '1',
          title: '회의 A',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '회의 B',
          date: '2025-10-15',
          startTime: '14:00',
          endTime: '15:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ];

      expect(shouldShowMoreButton(events3)).toBe(true);
      expect(shouldShowMoreButton(events2)).toBe(false);
    });
  });
});