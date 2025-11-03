import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';
import React from 'react';

import { handlers } from './__mocks__/handlers';

// Stub MUI icons to reduce file handles in test environment
vi.mock('@mui/icons-material', () => {
  const MockIcon = () => React.createElement('span');
  const WithTestId = (testId: string) => () =>
    React.createElement('span', { 'data-testid': testId });
  return {
    ChevronLeft: MockIcon,
    ChevronRight: MockIcon,
    Delete: MockIcon,
    Edit: MockIcon,
    Notifications: MockIcon,
    Repeat: WithTestId('RepeatIcon'),
    Close: MockIcon,
    default: {},
  };
});

// ! Hard 여기 제공 안함
/* msw */
export const server = setupServer(...handlers);

vi.stubEnv('TZ', 'UTC');

beforeAll(() => {
  server.listen();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

beforeEach(() => {
  expect.hasAssertions(); // ? Med: 이걸 왜 써야하는지 물어보자

  vi.setSystemTime(new Date('2025-10-01')); // ? Med: 이걸 왜 써야하는지 물어보자
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
  server.close();
});
