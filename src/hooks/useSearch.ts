import { useMemo, useState } from 'react';

import { Event } from '../types';
import { getFilteredEvents, sortEventsByDate } from '../utils/eventUtils';

export const useSearch = (events: Event[], currentDate: Date, view: 'week' | 'month') => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // 'asc' = 오래된순, 'desc' = 최신순

  const filteredEvents = useMemo(() => {
    const filtered = getFilteredEvents(events, searchTerm, currentDate, view);
    return sortEventsByDate(filtered, sortOrder);
  }, [events, searchTerm, currentDate, view, sortOrder]);

  return {
    searchTerm,
    setSearchTerm,
    filteredEvents,
    sortOrder,
    setSortOrder,
  };
};
