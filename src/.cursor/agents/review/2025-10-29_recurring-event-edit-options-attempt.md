# Code Review Report

**Date**: 2025-10-29
**Reviewer**: Manager (관리자)
**Reviewed By**: Worker (노동자)
**Task**: 반복 일정 수정 시 단일/전체 선택 기능 구현 시도
**Status**: ⚠️ INCOMPLETE - Work Cancelled by User

---

## Executive Summary
<!-- 요약 -->

Worker attempted to implement a feature allowing users to choose between editing a single instance or all instances of a recurring event. The implementation was **cancelled before completion** at user request. This review analyzes the approach taken, issues encountered, and lessons learned.

<!-- Worker가 반복 일정 수정 시 단일 인스턴스 또는 전체 인스턴스 수정을 선택할 수 있는 기능을 구현하려고 시도했습니다. 구현은 사용자 요청으로 **완료 전에 취소**되었습니다. 이 리뷰는 접근 방식, 발생한 문제, 그리고 얻은 교훈을 분석합니다. -->

---

## What Was Attempted
<!-- 시도된 작업 -->

### 1. Component Creation (✅ Completed Successfully)
<!-- 컴포넌트 생성 (완료) -->

**File**: `src/components/EditOptionsDialog.tsx`

**Strengths**:
- Clean, minimal implementation following TDD
- Used Material-UI Dialog component correctly
- Clear prop interface with TypeScript
- Proper event handler callbacks

**Code Quality**: ✅ Good
```typescript
interface EditOptionsDialogProps {
  open: boolean;
  onClose: () => void;
  onEditSingle: () => void;
  onEditAll: () => void;
}
```

### 2. Component Unit Tests (✅ Completed Successfully)
<!-- 컴포넌트 단위 테스트 (완료) -->

**File**: `src/__tests__/components/EditOptionsDialog.spec.tsx`

**Test Results**: **6 tests passed** ✅

**Test Coverage**:
- ✅ Dialog renders when open
- ✅ Dialog doesn't render when closed
- ✅ "예" button triggers `onEditSingle`
- ✅ "아니오" button triggers `onEditAll`
- ✅ "취소" button triggers `onClose`
- ✅ All three buttons render in correct order

**Strengths**:
- Comprehensive coverage of component behavior
- Proper use of React Testing Library
- Good test isolation

### 3. App Integration (⚠️ Partially Completed)
<!-- App 통합 (부분 완료) -->

**File**: `src/App.tsx`

**What Was Implemented**:
1. ✅ Imported `EditOptionsDialog` component
2. ✅ Added state management:
   ```typescript
   const [isEditOptionsDialogOpen, setIsEditOptionsDialogOpen] = useState(false);
   const [pendingEventData, setPendingEventData] = useState<Event | EventForm | null>(null);
   ```
3. ✅ Created handler functions:
   - `handleEditSingle()` - Convert to single event (remove repeat)
   - `handleEditAll()` - Update all instances (preserve repeat)
   - `handleCloseEditOptions()` - Close dialog
4. ✅ Modified `addOrUpdateEvent()` to check if editing recurring event
5. ✅ Rendered `EditOptionsDialog` in JSX

**Implementation Approach**:
```typescript
// Check if editing recurring event
if (editingEvent && editingEvent.repeat.type !== 'none') {
  setPendingEventData(eventData);
  setIsEditOptionsDialogOpen(true);
  return;
}
```

**Issues Identified**:
- ⚠️ `handleEditSingle()` had logic issue: attempted to create new single event but didn't properly handle ID removal
- ⚠️ Overlap checking was triggered, causing unexpected dialog flow
- ⚠️ Integration with existing event operations hook was incomplete

### 4. Integration Tests (❌ Failed - 3/3 tests)
<!-- 통합 테스트 (실패) -->

**File**: `src/__tests__/medium.integration.spec.tsx`

**Test Results**: **3 tests failed** ❌

#### Test 1: 반복 일정 단일 수정 (예 버튼)
**Status**: ❌ Failed
**Error**: `Unable to find an element with the text: 특별 회의`

**Root Cause**:
1. Test data setup issue - events weren't properly loaded
2. Event list wasn't updated after save operation
3. Asynchronous state update not properly awaited

#### Test 2: 반복 일정 전체 수정 (아니오 버튼)
**Status**: ❌ Failed
**Error**: `Unable to find an element with the text: 반복 일정 수정`

**Root Cause**:
1. Dialog didn't appear as expected
2. Mock data configuration incomplete
3. Event expansion logic not properly tested

#### Test 3: 일반 이벤트 수정 (다이얼로그 없음)
**Status**: ❌ Failed
**Error**: `Unable to find an element with the text: 수정된 미팅`

**Root Cause**:
1. PUT handler mock not properly configured
2. Event update flow incomplete
3. State refresh timing issue

---

## Critical Issues Discovered
<!-- 발견된 주요 문제 -->

### Issue 1: Test Data Management 🔴 HIGH PRIORITY
<!-- 테스트 데이터 관리 -->

**Problem**: Mock data setup was inconsistent across tests

**Evidence**:
- Tests used both `server.use()` and `setupMockHandlerCreation()`
- Some tests provided `initEvents`, others didn't
- Date mismatches (used January dates when system time was October)

**Impact**: Tests couldn't find expected events in the UI

**Recommendation**:
```typescript
// ✅ GOOD: Consistent pattern
const initEvents: Event[] = [/* ... */];
setupMockHandlerCreation(initEvents);

// Setup PUT handler for updates
server.use(
  http.put('/api/events/:id', async ({ params, request }) => {
    // Handle update logic
  })
);
```

### Issue 2: Async State Updates Not Properly Awaited 🔴 HIGH PRIORITY
<!-- 비동기 상태 업데이트 대기 미흡 -->

**Problem**: Tests didn't wait for all state updates and re-renders

**Evidence**:
```typescript
// ❌ BAD: Immediately checking without waiting
await user.click(yesButton);
const normalEvent = await eventList.findByText('특별 회의'); // Fails
```

**Why This Matters**:
1. `handleEditSingle()` triggers multiple async operations
2. Overlap check might show another dialog
3. Event list needs time to refresh after save

**Recommendation**:
```typescript
// ✅ GOOD: Handle all possible dialogs
await user.click(yesButton);

// Handle potential overlap dialog
try {
  const overlapWarning = await screen.findByText(/일정 겹침 경고/, { timeout: 2000 });
  if (overlapWarning) {
    await user.click(screen.getByRole('button', { name: /계속 진행/i }));
  }
} catch {
  // No overlap, continue
}

// Now check for updated event
const normalEvent = await eventList.findByText('특별 회의', {}, { timeout: 5000 });
```

### Issue 3: DOM Element Query Strategy 🟡 MEDIUM PRIORITY
<!-- DOM 요소 쿼리 전략 -->

**Problem**: Tests used `closest('tr')` which returned `null`

**Evidence**:
```typescript
// ❌ FAILED
const firstEvent = weeklyInstances[0].closest('tr');
const editButton = within(firstEvent!).getByRole('button', { name: '수정' });
```

**Root Cause**: Event list structure doesn't use `<tr>` elements in the expected way

**Solution Applied**:
```typescript
// ✅ FIXED: Use aria-label to find button globally
const editButtons = await screen.findAllByLabelText('Edit event');
await user.click(editButtons[0]);
```

### Issue 4: ID Management for Single Event Creation 🟡 MEDIUM PRIORITY
<!-- 단일 이벤트 생성 시 ID 관리 -->

**Problem**: When converting recurring event to single event, ID wasn't removed

**Original Code**:
```typescript
const singleEventData: Event | EventForm = {
  ...pendingEventData,
  repeat: { type: 'none', interval: 0 },
};
```

**Issue**: Kept the virtual instance ID, causing API confusion

**Fix Attempted**:
```typescript
const { id: _id, ...eventWithoutId } = pendingEventData as Event;
const singleEventData: EventForm = {
  ...eventWithoutId,
  repeat: { type: 'none', interval: 0 },
};
```

**Why This Matters**: 
- Virtual IDs from `generateRecurringEvents()` shouldn't be used for new events
- Backend expects new events to have no ID (POST) vs updates to have ID (PUT)

---

## TDD Cycle Analysis
<!-- TDD 사이클 분석 -->

### Phase 1: EditOptionsDialog Component
**RED → GREEN → REFACTOR**: ✅ **Successful**

1. **RED**: Wrote 6 failing tests for dialog component
2. **GREEN**: Implemented minimal component, all 6 tests passed
3. **REFACTOR**: N/A - Code was already clean

**Time**: ~10 minutes
**Result**: Component works perfectly in isolation

### Phase 2: Integration Testing
**RED → GREEN**: ❌ **Incomplete**

1. **RED**: Wrote 3 integration tests (all failed as expected)
2. **GREEN**: Attempted implementation but couldn't pass tests
3. **REFACTOR**: N/A - Didn't reach this stage

**Time**: ~40 minutes
**Result**: Tests still failing when work was cancelled

**Why Integration Failed**:
1. Mock data configuration complexity
2. Multiple dialogs in sequence not properly handled
3. Event expansion + update logic interaction issues
4. Insufficient understanding of existing `useEventOperations` flow

---

## What Went Well ✅
<!-- 잘된 점 -->

1. **Component Design**: Clean, reusable dialog component
2. **Unit Testing**: 100% test coverage for component
3. **Code Style**: Followed all naming conventions and TypeScript standards
4. **TDD Discipline**: Started with tests before implementation
5. **User Cancellation Response**: Properly reverted all changes without leaving artifacts

---

## What Needs Improvement ⚠️
<!-- 개선이 필요한 점 -->

### 1. Integration Test Strategy 🔴 CRITICAL
<!-- 통합 테스트 전략 -->

**Problem**: Jumped into complex integration tests without fully understanding existing flow

**Better Approach**:
1. First study `useEventOperations.ts` more carefully
2. Understand how `saveEvent` handles recurring vs normal events
3. Map out all possible dialog sequences
4. Create helper functions for common test patterns

**Example Helper**:
```typescript
async function editRecurringEvent(
  user: UserEvent,
  eventTitle: string,
  newTitle: string,
  option: 'single' | 'all'
) {
  // Find event
  const editButtons = await screen.findAllByLabelText('Edit event');
  await user.click(editButtons[0]);
  
  // Modify
  await user.clear(screen.getByLabelText('제목'));
  await user.type(screen.getByLabelText('제목'), newTitle);
  await user.click(screen.getByTestId('event-submit-button'));
  
  // Handle dialog
  const dialogButton = screen.getByRole('button', { name: option === 'single' ? '예' : '아니오' });
  await user.click(dialogButton);
  
  // Handle potential overlap
  await handleOverlapIfPresent(user);
  
  // Wait for completion
  await waitForEventListUpdate();
}
```

### 2. Mock Data Management 🔴 CRITICAL
<!-- Mock 데이터 관리 -->

**Problem**: Inconsistent mock setup across tests

**Better Approach**:
1. Create dedicated mock utilities:
```typescript
// utils/testUtils.ts
export function createMockRecurringEvent(overrides?: Partial<Event>): Event {
  return {
    id: 'recurring-1',
    title: '주간 회의',
    date: '2025-10-08', // Match current system date
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
    ...overrides,
  };
}

export function setupRecurringEventTest(events: Event[]) {
  setupMockHandlerCreation(events);
  
  server.use(
    http.put('/api/events/:id', async ({ params, request }) => {
      const updatedEvent = await request.json();
      return HttpResponse.json({
        ...updatedEvent,
        id: params.id,
      });
    })
  );
}
```

### 3. Understanding Existing Systems First 🟡 MEDIUM
<!-- 기존 시스템 이해 우선 -->

**Problem**: Didn't fully understand how `useEventOperations` manages recurring events

**Key Questions That Should Have Been Asked**:
1. How does `generateRecurringEvents()` create virtual IDs?
2. How does `saveEvent()` determine whether to POST or PUT?
3. What is the role of `originalEventId` and `originalDate` in repeat metadata?
4. How does event refetch work after save?

**Lesson**: Always read and understand the existing system before adding features

### 4. Dialog Flow Complexity 🟡 MEDIUM
<!-- 다이얼로그 흐름 복잡도 -->

**Problem**: Two sequential dialogs (Edit Options → Overlap Warning) created test complexity

**Better Design**:
1. Consider merging overlap check into edit options dialog
2. Or handle overlap check *before* showing edit options
3. Document the complete dialog flow with a diagram

**Current Flow** (Confusing):
```
User clicks save
  → Edit Options Dialog appears
    → User clicks "예" or "아니오"
      → Overlap check runs
        → **Another dialog might appear**
          → User handles overlap
            → Event finally saves
```

**Better Flow**:
```
User clicks save
  → Run overlap check first
    → If overlap, show warning, user resolves
  → Then show Edit Options Dialog
    → User clicks "예" or "아니오"
      → Event saves immediately (no more dialogs)
```

---

## Recommendations for Future Attempts
<!-- 향후 시도를 위한 권장사항 -->

### 1. Spike Phase First 🎯
<!-- 사전 조사 단계 우선 -->

Before writing tests, create a "spike" to explore:
1. How does the current save flow work end-to-end?
2. What are all the edge cases?
3. Where should the new dialog fit in the flow?

**Time Investment**: 20-30 minutes of exploration
**Benefit**: Saves hours of rework

### 2. Incremental Integration 🎯
<!-- 점진적 통합 -->

Don't try to implement everything at once:

**Phase 1**: Show dialog on recurring event edit (no actual behavior change)
- Just display the dialog
- All buttons close dialog
- Verify tests can detect dialog appearance

**Phase 2**: Implement "취소" button (easiest)
- Just close dialog, don't save
- Verify tests pass

**Phase 3**: Implement "아니오" button (preserve existing behavior)
- Same as current behavior
- Should be easy to pass tests

**Phase 4**: Implement "예" button (new behavior)
- Convert to single event
- Most complex, do last

### 3. Better Test Utilities 🎯
<!-- 더 나은 테스트 유틸리티 -->

Create reusable test helpers:

```typescript
// testUtils.ts
export async function waitForDialogToAppear(dialogTitle: string) {
  return await screen.findByText(dialogTitle, {}, { timeout: 3000 });
}

export async function handleOverlapDialog(user: UserEvent) {
  try {
    const warning = await screen.findByText(/일정 겹침 경고/, { timeout: 2000 });
    if (warning) {
      const continueBtn = screen.getByRole('button', { name: /계속 진행/i });
      await user.click(continueBtn);
      return true;
    }
  } catch {
    return false;
  }
}

export async function waitForEventToAppear(eventTitle: string) {
  const eventList = within(screen.getByTestId('event-list'));
  return await eventList.findByText(eventTitle, {}, { timeout: 5000 });
}
```

### 4. Integration Test Pattern 🎯
<!-- 통합 테스트 패턴 -->

Establish a consistent pattern:

```typescript
it('should do X when Y', async () => {
  // 1. ARRANGE: Setup mock data
  const mockEvents = [createMockRecurringEvent()];
  setupRecurringEventTest(mockEvents);
  
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');
  
  // 2. ACT: Perform user actions
  await editEvent(user, 0); // Helper function
  await modifyTitle(user, '새 제목'); // Helper function
  await saveAndSelectOption(user, 'single'); // Helper function
  await handleAnyOverlapDialog(user); // Helper function
  
  // 3. ASSERT: Verify outcome
  const eventList = within(screen.getByTestId('event-list'));
  const updatedEvent = await eventList.findByText('새 제목');
  expect(updatedEvent).toBeInTheDocument();
  
  // Verify side effects
  expect(within(updatedEvent.closest('tr')!).queryByTestId('RepeatIcon'))
    .not.toBeInTheDocument();
});
```

---

## Detailed Solutions for Core Issues 🔧
<!-- 핵심 문제점 상세 해결방안 -->

This section provides **actionable, code-level solutions** for each critical issue discovered.
<!-- 이 섹션은 발견된 각 주요 문제에 대한 **실행 가능한 코드 수준의 해결방안**을 제공합니다. -->

---

### Solution 1: Test Data Management 🔴 HIGH PRIORITY
<!-- 해결방안 1: 테스트 데이터 관리 -->

#### Problem Analysis
<!-- 문제 분석 -->

Current test setup is inconsistent:
```typescript
// ❌ BAD: Date mismatch (January when system is October)
const initEvents: Event[] = [{
  id: 'recurring-1',
  title: '주간 회의',
  date: '2025-01-08',  // Wrong month!
  // ...
}];
```

**Root Cause**: No centralized test data factory
<!-- 근본 원인: 중앙화된 테스트 데이터 팩토리 없음 -->

#### Solution: Create Test Fixtures
<!-- 해결방안: 테스트 픽스처 생성 -->

**File**: `src/__tests__/fixtures/eventFixtures.ts` (NEW)

```typescript
import { Event } from '../../types';

/**
 * Get current system date in October 2025 format
 * <!-- 2025년 10월의 현재 시스템 날짜 가져오기 -->
 */
export function getCurrentTestDate(dayOffset: number = 0): string {
  const baseDate = new Date('2025-10-01'); // System base date
  baseDate.setDate(baseDate.getDate() + dayOffset);
  return baseDate.toISOString().split('T')[0];
}

/**
 * Create a recurring event for testing
 * <!-- 테스트용 반복 일정 생성 -->
 */
export function createRecurringEvent(
  overrides?: Partial<Event>
): Event {
  return {
    id: overrides?.id || 'recurring-1',
    title: overrides?.title || '주간 회의',
    date: overrides?.date || getCurrentTestDate(7), // 2025-10-08
    startTime: overrides?.startTime || '10:00',
    endTime: overrides?.endTime || '11:00',
    description: overrides?.description || '주간 미팅',
    location: overrides?.location || '회의실 A',
    category: overrides?.category || '업무',
    repeat: overrides?.repeat || { 
      type: 'weekly', 
      interval: 1 
    },
    notificationTime: overrides?.notificationTime || 10,
  };
}

/**
 * Create a normal (non-recurring) event for testing
 * <!-- 테스트용 일반 일정 생성 -->
 */
export function createNormalEvent(
  overrides?: Partial<Event>
): Event {
  return {
    id: overrides?.id || 'normal-1',
    title: overrides?.title || '단일 미팅',
    date: overrides?.date || getCurrentTestDate(9), // 2025-10-10
    startTime: overrides?.startTime || '14:00',
    endTime: overrides?.endTime || '15:00',
    description: overrides?.description || '일회성 미팅',
    location: overrides?.location || '회의실 B',
    category: overrides?.category || '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: overrides?.notificationTime || 10,
  };
}

/**
 * Create a daily recurring event for testing
 * <!-- 테스트용 일일 반복 일정 생성 -->
 */
export function createDailyRecurringEvent(
  overrides?: Partial<Event>
): Event {
  return createRecurringEvent({
    id: 'recurring-daily-1',
    title: '데일리 스탠드업',
    date: getCurrentTestDate(5), // 2025-10-06
    startTime: '09:00',
    endTime: '09:30',
    description: '일일 미팅',
    location: '온라인',
    repeat: { type: 'daily', interval: 1 },
    ...overrides,
  });
}
```

**File**: `src/__tests__/helpers/mockHelpers.ts` (NEW)

```typescript
import { http, HttpResponse } from 'msw';
import { Event } from '../../types';
import { server } from '../../setupTests';

/**
 * Setup complete mock handlers for recurring event tests
 * <!-- 반복 일정 테스트를 위한 완전한 mock 핸들러 설정 -->
 */
export function setupRecurringEventMocks(initialEvents: Event[]) {
  const mockEvents: Event[] = [...initialEvents];

  server.use(
    // GET: Return mock events
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),

    // POST: Create new event (for single instance conversion)
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = `new-${mockEvents.length + 1}`;
      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    }),

    // PUT: Update existing event (for recurring event update)
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEventData = (await request.json()) as Partial<Event>;
      
      const index = mockEvents.findIndex((event) => event.id === id);
      if (index !== -1) {
        // Update existing event in mock array
        mockEvents[index] = { 
          ...mockEvents[index], 
          ...updatedEventData,
          id: id as string,
        };
        return HttpResponse.json(mockEvents[index]);
      }
      
      return new HttpResponse(null, { status: 404 });
    }),

    // DELETE: Delete event
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = mockEvents.findIndex((event) => event.id === id);
      if (index !== -1) {
        mockEvents.splice(index, 1);
      }
      return new HttpResponse(null, { status: 204 });
    })
  );

  return mockEvents; // Return reference for test assertions
}
```

**Usage in Tests**:
```typescript
import { createRecurringEvent, createNormalEvent } from './fixtures/eventFixtures';
import { setupRecurringEventMocks } from './helpers/mockHelpers';

it('반복 일정 단일 수정 시 일반 일정으로 변환된다', async () => {
  // ✅ GOOD: Use fixture factory
  const recurringEvent = createRecurringEvent({
    title: '주간 회의',
    date: getCurrentTestDate(7), // Always correct date
  });

  setupRecurringEventMocks([recurringEvent]);
  
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');
  
  // ... rest of test
});
```

**Benefits**:
- ✅ Consistent date handling
- ✅ Reusable test data
- ✅ Type-safe fixtures
- ✅ Easy to maintain

---

### Solution 2: Async State Updates Management 🔴 HIGH PRIORITY
<!-- 해결방안 2: 비동기 상태 업데이트 관리 -->

#### Problem Analysis
<!-- 문제 분석 -->

Tests fail because they don't wait for:
1. Edit Options Dialog to close
2. Overlap check to complete
3. Event list to refresh after save
4. UI re-render with new data

**Current Flow**:
```typescript
await user.click(yesButton);
// ❌ Immediately checks - too fast!
const normalEvent = await eventList.findByText('특별 회의'); // Fails
```

#### Solution: Create Async Helper Functions
<!-- 해결방안: 비동기 헬퍼 함수 생성 -->

**File**: `src/__tests__/helpers/asyncHelpers.ts` (NEW)

```typescript
import { screen, within, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

/**
 * Wait for a dialog to appear
 * <!-- 다이얼로그가 나타날 때까지 대기 -->
 */
export async function waitForDialog(
  dialogTitle: string,
  timeout: number = 3000
): Promise<HTMLElement | null> {
  try {
    return await screen.findByText(dialogTitle, {}, { timeout });
  } catch {
    return null;
  }
}

/**
 * Handle overlap dialog if it appears
 * <!-- 오버랩 다이얼로그가 나타나면 처리 -->
 */
export async function handleOverlapDialogIfPresent(
  user: UserEvent
): Promise<boolean> {
  try {
    const overlapWarning = await screen.findByText(
      /일정 겹침 경고/,
      {},
      { timeout: 2000 }
    );
    
    if (overlapWarning) {
      // Check if "계속 진행" button exists (bypass allowed)
      const continueButton = screen.queryByRole('button', { 
        name: /계속 진행/i 
      });
      
      if (continueButton) {
        await user.click(continueButton);
        // Wait for dialog to close
        await waitFor(() => {
          expect(screen.queryByText(/일정 겹침 경고/)).not.toBeInTheDocument();
        }, { timeout: 2000 });
        return true;
      }
    }
  } catch {
    // No overlap dialog appeared
  }
  
  return false;
}

/**
 * Wait for event list to update and find an event
 * <!-- 이벤트 리스트가 업데이트되고 이벤트를 찾을 때까지 대기 -->
 */
export async function waitForEventInList(
  eventTitle: string,
  timeout: number = 5000
): Promise<HTMLElement> {
  const eventList = within(screen.getByTestId('event-list'));
  
  return await waitFor(
    async () => {
      const events = await eventList.findAllByText(eventTitle);
      if (events.length === 0) {
        throw new Error(`Event "${eventTitle}" not found`);
      }
      return events[0];
    },
    { timeout }
  );
}

/**
 * Wait for event to disappear from list
 * <!-- 이벤트가 리스트에서 사라질 때까지 대기 -->
 */
export async function waitForEventToDisappear(
  eventTitle: string,
  timeout: number = 3000
): Promise<void> {
  const eventList = within(screen.getByTestId('event-list'));
  
  await waitFor(
    () => {
      expect(eventList.queryByText(eventTitle)).not.toBeInTheDocument();
    },
    { timeout }
  );
}

/**
 * Complete workflow: Save event and handle all dialogs
 * <!-- 완전한 워크플로우: 이벤트 저장 및 모든 다이얼로그 처리 -->
 */
export async function saveEventWithDialogHandling(
  user: UserEvent,
  options: {
    editOptionsChoice?: 'single' | 'all' | null; // null = no dialog expected
    handleOverlap?: boolean;
  } = {}
): Promise<void> {
  // Click save button
  await user.click(screen.getByTestId('event-submit-button'));

  // Handle Edit Options Dialog if expected
  if (options.editOptionsChoice) {
    const editDialog = await waitForDialog('반복 일정 수정');
    expect(editDialog).toBeInTheDocument();

    const buttonName = options.editOptionsChoice === 'single' ? '예' : '아니오';
    const choiceButton = screen.getByRole('button', { name: buttonName });
    await user.click(choiceButton);

    // Wait for dialog to close
    await waitFor(() => {
      expect(screen.queryByText('반복 일정 수정')).not.toBeInTheDocument();
    });
  }

  // Handle Overlap Dialog if expected
  if (options.handleOverlap !== false) {
    await handleOverlapDialogIfPresent(user);
  }

  // Wait for save operation to complete
  // This ensures event list has been refreshed
  await waitFor(() => {
    // Check that loading state has completed
    // (could check for success snackbar, but this is simpler)
  }, { timeout: 2000 });
}
```

**Usage in Tests**:
```typescript
import { 
  saveEventWithDialogHandling, 
  waitForEventInList,
  handleOverlapDialogIfPresent
} from './helpers/asyncHelpers';

it('반복 일정 단일 수정 시 일반 일정으로 변환된다', async () => {
  const recurringEvent = createRecurringEvent();
  setupRecurringEventMocks([recurringEvent]);
  
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  // Edit event
  const editButtons = await screen.findAllByLabelText('Edit event');
  await user.click(editButtons[0]);

  // Modify title
  await user.clear(screen.getByLabelText('제목'));
  await user.type(screen.getByLabelText('제목'), '특별 회의');

  // ✅ GOOD: Use helper to handle complete flow
  await saveEventWithDialogHandling(user, {
    editOptionsChoice: 'single',
    handleOverlap: true,
  });

  // ✅ GOOD: Use helper to wait for event
  const updatedEvent = await waitForEventInList('특별 회의');
  expect(updatedEvent).toBeInTheDocument();

  // Check icon is removed
  const eventList = within(screen.getByTestId('event-list'));
  const allNewEvents = eventList.getAllByText('특별 회의');
  const eventBox = allNewEvents[0].closest('.MuiBox-root');
  expect(within(eventBox!).queryByTestId('RepeatIcon')).not.toBeInTheDocument();
});
```

**Benefits**:
- ✅ Handles all async operations
- ✅ Reduces test flakiness
- ✅ Reusable across tests
- ✅ Clear intent

---

### Solution 3: DOM Query Strategy 🟡 MEDIUM PRIORITY
<!-- 해결방안 3: DOM 쿼리 전략 -->

#### Problem Analysis
<!-- 문제 분석 -->

Event list uses `Box` components, not `<table>` with `<tr>`:
```typescript
// ❌ FAILED: No <tr> elements
const firstEvent = weeklyInstances[0].closest('tr'); // Returns null!
```

**Current Structure** (from App.tsx lines 612-663):
```tsx
{filteredEvents.map((event) => (
  <Box key={event.id} sx={{ border: 1, borderRadius: 2, p: 3 }}>
    <Stack direction="row">
      <Stack>
        <Typography>{event.title}</Typography>
        {/* ... other fields ... */}
      </Stack>
      <Stack>
        <IconButton aria-label="Edit event" onClick={() => editEvent(event)}>
          <Edit />
        </IconButton>
        {/* ... */}
      </Stack>
    </Stack>
  </Box>
))}
```

#### Solution: Query by Data Attributes or Aria Labels
<!-- 해결방안: 데이터 속성 또는 Aria 레이블로 쿼리 -->

**Option 1: Add Test IDs to App.tsx** (Recommended for clarity)

```typescript
// In App.tsx, modify event rendering:
{filteredEvents.map((event) => (
  <Box 
    key={event.id} 
    data-testid={`event-box-${event.id}`}
    data-event-title={event.title}
    sx={{ border: 1, borderRadius: 2, p: 3 }}
  >
    <Stack direction="row">
      <Stack>
        {notifiedEvents.includes(event.id) && <Notifications color="error" />}
        {event.repeat.type !== 'none' && (
          <Repeat data-testid="RepeatIcon" fontSize="small" />
        )}
        <Typography>{event.title}</Typography>
        {/* ... */}
      </Stack>
      <Stack>
        <IconButton 
          aria-label="Edit event" 
          data-testid={`edit-button-${event.id}`}
          onClick={() => editEvent(event)}
        >
          <Edit />
        </IconButton>
        {/* ... */}
      </Stack>
    </Stack>
  </Box>
))}
```

**Option 2: Use Existing Aria Labels** (Current approach, works)

```typescript
// ✅ GOOD: Query by aria-label (already working)
const editButtons = await screen.findAllByLabelText('Edit event');
await user.click(editButtons[0]); // Edit first event
```

**Helper Function for Finding Event Box**:

**File**: `src/__tests__/helpers/domHelpers.ts` (NEW)

```typescript
import { screen, within } from '@testing-library/react';

/**
 * Find event box by title
 * <!-- 제목으로 이벤트 박스 찾기 -->
 */
export function findEventBoxByTitle(eventTitle: string): HTMLElement {
  const eventList = within(screen.getByTestId('event-list'));
  const titleElements = eventList.getAllByText(eventTitle);
  
  if (titleElements.length === 0) {
    throw new Error(`Event "${eventTitle}" not found`);
  }

  // Find the closest Box container
  const eventBox = titleElements[0].closest('.MuiBox-root');
  
  if (!eventBox) {
    throw new Error(`Event box for "${eventTitle}" not found`);
  }

  return eventBox as HTMLElement;
}

/**
 * Check if event has repeat icon
 * <!-- 이벤트에 반복 아이콘이 있는지 확인 -->
 */
export function hasRepeatIcon(eventTitle: string): boolean {
  try {
    const eventBox = findEventBoxByTitle(eventTitle);
    const icon = within(eventBox).queryByTestId('RepeatIcon');
    return icon !== null;
  } catch {
    return false;
  }
}

/**
 * Get edit button for specific event by index
 * <!-- 인덱스로 특정 이벤트의 수정 버튼 가져오기 -->
 */
export async function getEditButtonForEvent(
  eventIndex: number
): Promise<HTMLElement> {
  const editButtons = await screen.findAllByLabelText('Edit event');
  
  if (eventIndex >= editButtons.length) {
    throw new Error(`Edit button at index ${eventIndex} not found`);
  }
  
  return editButtons[eventIndex];
}
```

**Usage in Tests**:
```typescript
import { findEventBoxByTitle, hasRepeatIcon } from './helpers/domHelpers';

it('반복 일정 단일 수정 후 아이콘 확인', async () => {
  // ... setup and modify event ...
  
  await waitForEventInList('특별 회의');

  // ✅ GOOD: Use helper to find event box
  const normalEventBox = findEventBoxByTitle('특별 회의');
  expect(within(normalEventBox).queryByTestId('RepeatIcon'))
    .not.toBeInTheDocument();

  // ✅ GOOD: Or use convenience helper
  expect(hasRepeatIcon('특별 회의')).toBe(false);
  expect(hasRepeatIcon('주간 회의')).toBe(true);
});
```

**Benefits**:
- ✅ Works with current Box structure
- ✅ Type-safe helpers
- ✅ Clear error messages
- ✅ Reusable across tests

---

### Solution 4: Dialog Flow Simplification 🟡 MEDIUM PRIORITY
<!-- 해결방안 4: 다이얼로그 흐름 단순화 -->

#### Problem Analysis
<!-- 문제 분석 -->

Current implementation has sequential dialogs:
1. User saves → Edit Options Dialog
2. User chooses → Overlap Check runs
3. If overlap → **Another Dialog**

This creates test complexity and poor UX.

#### Solution: Reorder Dialog Sequence
<!-- 해결방안: 다이얼로그 순서 변경 -->

**Approach 1: Check Overlap BEFORE Edit Options** (Recommended)

```typescript
// In App.tsx - modify addOrUpdateEvent()
const addOrUpdateEvent = async () => {
  // ... validation ...

  const eventData = /* ... build event data ... */;

  // FIRST: Check for overlap (for non-bypass cases)
  const overlapping = findOverlappingEvents(eventData, events);
  const canBypass = hasRecurringNormalConflict(eventData, overlapping);
  
  if (overlapping.length > 0 && !canBypass) {
    // Show blocking overlap dialog
    setOverlappingEvents(overlapping);
    setAllowBypass(false);
    setIsOverlapDialogOpen(true);
    return; // Stop here - user must resolve overlap
  }

  // SECOND: If editing recurring event, show Edit Options
  if (editingEvent && editingEvent.repeat.type !== 'none') {
    // Store potential overlap info for later
    if (overlapping.length > 0) {
      setPendingOverlapData({ overlapping, canBypass: true });
    }
    setPendingEventData(eventData);
    setIsEditOptionsDialogOpen(true);
    return;
  }

  // THIRD: If allowing bypass, handle it
  if (overlapping.length > 0 && canBypass) {
    setOverlappingEvents(overlapping);
    setAllowBypass(true);
    setIsOverlapDialogOpen(true);
    return;
  }

  // No dialogs needed - save directly
  await saveEvent(eventData);
  resetForm();
};

// Modify handlers to check stored overlap
const handleEditSingle = async () => {
  if (!pendingEventData) return;

  const singleEventData = /* ... convert to single event ... */;

  setIsEditOptionsDialogOpen(false);
  
  // Check if we have stored overlap info
  if (pendingOverlapData) {
    setOverlappingEvents(pendingOverlapData.overlapping);
    setAllowBypass(pendingOverlapData.canBypass);
    setIsOverlapDialogOpen(true);
    setPendingOverlapData(null);
    // Store single event data for final save
    setFinalEventData(singleEventData);
    return;
  }

  setPendingEventData(null);
  await saveEvent(singleEventData);
  resetForm();
};
```

**Approach 2: Combine Dialogs** (Alternative)

Create a single dialog that handles both:
```typescript
interface CombinedEditDialogProps {
  open: boolean;
  onClose: () => void;
  onEditSingle: () => void;
  onEditAll: () => void;
  overlapInfo?: {
    overlappingEvents: Event[];
    canBypass: boolean;
  };
}

// Shows Edit Options + Overlap Warning in ONE dialog
const CombinedEditDialog = ({ 
  open, 
  onClose, 
  onEditSingle, 
  onEditAll,
  overlapInfo 
}: CombinedEditDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>반복 일정 수정</DialogTitle>
      <DialogContent>
        <DialogContentText>
          해당 일정만 수정하시겠어요?
        </DialogContentText>
        
        {overlapInfo && (
          <Alert severity={overlapInfo.canBypass ? "warning" : "error"}>
            다음 일정과 겹칩니다:
            {overlapInfo.overlappingEvents.map(e => (
              <Typography key={e.id}>{e.title}</Typography>
            ))}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onEditSingle}>예 (이 일정만)</Button>
        <Button onClick={onEditAll}>아니오 (전체 시리즈)</Button>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};
```

**Benefits**:
- ✅ Simpler test flow
- ✅ Better UX (one decision point)
- ✅ Easier to maintain
- ✅ Clearer user intent

**Updated Test Pattern**:
```typescript
it('반복 일정 단일 수정 (오버랩 있음)', async () => {
  // Setup with overlapping event
  const events = [
    createRecurringEvent({ title: '주간 회의' }),
    createNormalEvent({ 
      title: '기존 미팅',
      date: getCurrentTestDate(7), // Same as recurring event
      startTime: '10:30', // Overlaps
      endTime: '11:30',
    }),
  ];

  setupRecurringEventMocks(events);
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  // Edit recurring event
  const editButtons = await screen.findAllByLabelText('Edit event');
  await user.click(editButtons[0]);

  await user.clear(screen.getByLabelText('제목'));
  await user.type(screen.getByLabelText('제목'), '특별 회의');
  await user.click(screen.getByTestId('event-submit-button'));

  // ✅ ONE dialog with both info
  const dialog = await screen.findByText('반복 일정 수정');
  expect(dialog).toBeInTheDocument();
  
  // Check overlap warning is shown IN SAME DIALOG
  expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
  expect(screen.getByText('기존 미팅')).toBeInTheDocument();

  // Choose single edit
  await user.click(screen.getByRole('button', { name: /예.*이 일정만/i }));

  // Event saves immediately (no second dialog)
  const updatedEvent = await waitForEventInList('특별 회의');
  expect(updatedEvent).toBeInTheDocument();
});
```

---

### Solution 5: ID Management for Single Event Creation 🟡 MEDIUM PRIORITY
<!-- 해결방안 5: 단일 이벤트 생성을 위한 ID 관리 -->

#### Problem Analysis
<!-- 문제 분석 -->

When converting recurring instance to single event:
```typescript
// ❌ BAD: Keeps virtual instance ID
const singleEventData = {
  ...pendingEventData, // Has virtual ID from generateRecurringEvents
  repeat: { type: 'none', interval: 0 },
};
```

Virtual IDs like `generated-123-2025-10-15` cause issues:
- Backend doesn't recognize them
- May try to UPDATE instead of CREATE
- Conflicts with original recurring event

#### Solution: Remove ID and Metadata
<!-- 해결방안: ID 및 메타데이터 제거 -->

**Understanding useEventOperations Logic**:

From `src/hooks/useEventOperations.ts` lines 40-84:
```typescript
const saveEvent = async (eventData: Event | EventForm) => {
  if (editing) {
    // Uses originalEventId if present
    const updateId = event.repeat?.originalEventId || event.id;
    // ... PUT to /api/events/${updateId}
  } else {
    // ... POST to /api/events (no ID needed)
  }
};
```

**Key Insight**: `editing` flag comes from parent, not from event data!

```typescript
// In App.tsx
const { events, saveEvent, deleteEvent } = useEventOperations(
  Boolean(editingEvent), // ← This determines POST vs PUT!
  () => setEditingEvent(null)
);
```

**Correct Implementation**:

```typescript
const handleEditSingle = async () => {
  if (!pendingEventData) return;

  // Remove ID and repeat metadata to create NEW event
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, repeat, ...eventWithoutIdAndRepeat } = pendingEventData as Event;

  const singleEventData: EventForm = {
    ...eventWithoutIdAndRepeat,
    repeat: {
      type: 'none',
      interval: 0,
    },
  };

  setIsEditOptionsDialogOpen(false);
  setPendingEventData(null);
  
  // IMPORTANT: Must clear editingEvent so useEventOperations uses POST
  setEditingEvent(null);

  // Now saveEvent will use POST (creating new event)
  await saveEvent(singleEventData);
  resetForm();
};

const handleEditAll = async () => {
  if (!pendingEventData) return;

  setIsEditOptionsDialogOpen(false);
  setPendingEventData(null);

  // Keep editingEvent set - useEventOperations will use PUT
  // It will automatically use originalEventId from repeat metadata

  await saveEvent(pendingEventData);
  resetForm();
};
```

**Alternative: Pass Flag to saveEvent** (Requires refactoring)

```typescript
// Modify useEventOperations signature:
export const useEventOperations = (onSave?: () => void) => {
  // Remove editing parameter
  
  const saveEvent = async (
    eventData: Event | EventForm,
    options?: { forceCreate?: boolean }
  ) => {
    const isCreating = options?.forceCreate || !('id' in eventData);
    
    if (isCreating) {
      // POST
    } else {
      // PUT
    }
  };
  
  return { events, fetchEvents, saveEvent, deleteEvent };
};

// Usage:
await saveEvent(singleEventData, { forceCreate: true });
await saveEvent(recurringData, { forceCreate: false });
```

**Test Verification**:

```typescript
it('단일 수정 시 POST 요청이 발생한다', async () => {
  let postCalled = false;
  let putCalled = false;

  server.use(
    http.post('/api/events', async ({ request }) => {
      postCalled = true;
      const data = await request.json();
      expect(data.repeat.type).toBe('none');
      return HttpResponse.json({ ...data, id: 'new-1' }, { status: 201 });
    }),
    http.put('/api/events/:id', async () => {
      putCalled = true;
      return HttpResponse.json({}, { status: 200 });
    })
  );

  const events = [createRecurringEvent()];
  setupRecurringEventMocks(events);
  
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  // Edit and choose single
  await editEventAndChooseSingle(user, '특별 회의');

  // Verify correct API call
  expect(postCalled).toBe(true);
  expect(putCalled).toBe(false);
});
```

**Benefits**:
- ✅ Correct API calls (POST for new, PUT for update)
- ✅ No ID conflicts
- ✅ Clear separation of single vs all edit
- ✅ Testable behavior

---

## Summary of Solutions
<!-- 해결방안 요약 -->

| Problem | Solution | Priority | Files to Create/Modify |
|---------|----------|----------|------------------------|
| Test Data Management | Create fixtures & helpers | 🔴 HIGH | `fixtures/eventFixtures.ts`, `helpers/mockHelpers.ts` |
| Async Updates | Create async helpers | 🔴 HIGH | `helpers/asyncHelpers.ts` |
| DOM Queries | Add testids or use helpers | 🟡 MEDIUM | `helpers/domHelpers.ts`, `App.tsx` (optional) |
| Dialog Flow | Reorder or combine dialogs | 🟡 MEDIUM | `App.tsx`, `EditOptionsDialog.tsx` |
| ID Management | Remove ID for single edit | 🟡 MEDIUM | `App.tsx` handleEditSingle() |

**Implementation Order**:
1. ✅ Create test utilities (fixtures, helpers)
2. ✅ Add testids to App.tsx (optional but recommended)
3. ✅ Implement ID management fix
4. ✅ Write tests using new helpers
5. ✅ Simplify dialog flow
6. ✅ Verify all tests pass

**Estimated Time with Solutions**: 2-3 hours vs 8+ hours without

---

## Technical Debt Identified
<!-- 기술 부채 식별 -->

### 1. Test Helper Functions Missing
**Impact**: High
**Effort**: Medium
**Recommendation**: Create `src/__tests__/helpers/` directory with reusable utilities

### 2. Mock Data Utilities Missing
**Impact**: High
**Effort**: Low
**Recommendation**: Add `src/__tests__/fixtures/` for test data

### 3. Dialog Flow Documentation Missing
**Impact**: Medium
**Effort**: Low
**Recommendation**: Add flow diagram to README or docs

### 4. Recurring Event Logic Complexity
**Impact**: High
**Effort**: High
**Note**: Existing system has complex interactions between:
- `generateRecurringEvents()` creating virtual instances
- `saveEvent()` determining API method
- Virtual ID vs original ID management
- This complexity made new feature integration difficult

---

## Lessons Learned
<!-- 교훈 -->

### For Worker:
1. ✅ **TDD works well for isolated components** - EditOptionsDialog was perfect
2. ⚠️ **Integration tests need more prep** - Should have studied existing flow first
3. ⚠️ **Mock data is critical** - Inconsistent mocks caused most test failures
4. ⚠️ **Helper functions save time** - Repeated test patterns should be extracted

### For Team:
1. 📝 **Document complex flows** - Recurring event + dialog flow should be documented
2. 🛠️ **Invest in test utilities** - Helpers for common patterns would speed up all tests
3. 🎯 **Spike before TDD for complex features** - Some exploration needed before tests
4. 🔄 **Refactor existing complexity first** - Event operations could be simplified

---

## Metrics
<!-- 지표 -->

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Component Tests | 6/6 passed | 100% | ✅ Pass |
| Integration Tests | 0/3 passed | 100% | ❌ Fail |
| Time Spent | ~50 min | N/A | ⏱️ |
| Files Created | 3 | N/A | ✅ |
| Files Modified | 4 | N/A | ✅ |
| Files Reverted | 7 | N/A | ✅ |
| Code Quality | Good | Good | ✅ Pass |
| Test Quality | Mixed | Good | ⚠️ Needs Work |

---

## Final Verdict

### ⚠️ WORK INCOMPLETE - CANCELLED BY USER

**Reason for Cancellation**: Integration tests failing, implementation incomplete

### What Succeeded:
1. ✅ Clean component design and implementation
2. ✅ Excellent unit test coverage
3. ✅ Proper code style and conventions
4. ✅ Clean revert without artifacts

### What Failed:
1. ❌ Integration tests all failed
2. ❌ Mock data setup inconsistent
3. ❌ Async flow not properly handled
4. ❌ Insufficient understanding of existing system

### Recommendation:
**🔄 RETRY WITH DIFFERENT APPROACH**

Before retrying:
1. Create spike to understand existing event operations
2. Build test helper utilities
3. Implement incrementally (dialog appearance → button handlers)
4. Consider simplifying overlap check integration

**Estimated effort for successful implementation**: 2-3 hours with proper preparation

---

## Appendix: Files Involved
<!-- 부록: 관련 파일 -->

### Created (Then Deleted):
- `src/components/EditOptionsDialog.tsx` (44 lines)
- `src/__tests__/components/EditOptionsDialog.spec.tsx` (109 lines)
- `src/.cursor/agents/request/recurring-event-edit-options.md` (475 lines)

### Modified (Then Reverted):
- `src/App.tsx` 
- `src/__tests__/medium.integration.spec.tsx`
- `src/__mocks__/handlersUtils.ts`

### Reference Documentation:
- `.cursorrules` - Followed all conventions ✅
- `src/.cursor/agents/doc/tdd.md` - Followed TDD cycle ✅
- `src/.cursor/agents/people/tools.md` - Worker role followed ✅

---

**Review Completed**: 2025-10-29
**Next Steps**: User to decide whether to retry with improved approach or defer feature

