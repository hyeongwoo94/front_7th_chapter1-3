import { Event } from '../types';
import { getWeekDates, isDateInRange } from './dateUtils';

function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

function filterEventsByDateRangeAtMonth(events: Event[], currentDate: Date) {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return filterEventsByDateRange(events, monthStart, monthEnd);
}

export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const searchedEvents = searchEvents(events, searchTerm);

  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }

  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}

export function sortEventsByDate(events: Event[], order: 'asc' | 'desc'): Event[] {
  return [...events].sort((a, b) => {
    // 1순위: 날짜 비교
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) {
      return order === 'asc' ? dateCompare : -dateCompare;
    }

    // 2순위: 시간 비교 (날짜가 같을 경우)
    const timeCompare = a.startTime.localeCompare(b.startTime);
    if (timeCompare !== 0) {
      return order === 'asc' ? timeCompare : -timeCompare;
    }

    // 3순위: 제목 비교 (날짜와 시간이 모두 같을 경우)
    const titleCompare = a.title.localeCompare(b.title);
    return order === 'asc' ? titleCompare : -titleCompare;
  });
}
