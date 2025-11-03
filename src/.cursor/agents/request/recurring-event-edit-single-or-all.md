# Feature Request: 반복 일정 수정 시 단일/전체 선택 기능

**Date**: 2025-10-29
**Requester**: User/King
**Status**: ⏳ Pending Review

---

## ⚠️ CRITICAL: Previous Attempt Failed
<!-- 주의: 이전 시도 실패 -->

**This feature was attempted on 2025-10-29 and CANCELLED.**
<!-- 이 기능은 2025-10-29에 시도되었으나 취소되었습니다. -->

**Review Reference**: `review/2025-10-29_recurring-event-edit-options-attempt.md`

**Failure Reasons**:
1. Test data management issues (date mismatches)
2. Async state update handling incomplete
3. DOM query strategy errors
4. Complex dialog flow
5. ID management problems (POST vs PUT)

**This document incorporates ALL solutions from the review.**
<!-- 이 문서는 리뷰의 모든 해결방안을 통합합니다. -->

---

## 1. Feature Overview
<!-- 기능 개요 -->

**What**: Add dialog to choose between editing single instance or all instances when modifying a recurring event
<!-- 무엇을: 반복 일정 수정 시 단일 인스턴스 또는 전체 인스턴스 수정 선택 다이얼로그 추가 -->

**Why**: Currently, editing a recurring event modifies ALL instances. Users need the option to edit just one occurrence without affecting the entire series.
<!-- 왜: 현재 반복 일정 수정 시 모든 인스턴스가 변경됩니다. 사용자는 전체 시리즈에 영향을 주지 않고 단일 발생만 수정할 수 있어야 합니다. -->

**User Story**: As a calendar user, I want to choose whether to edit just one instance or all instances of a recurring event, so that I can make changes without affecting the entire series when needed.
<!-- 사용자 스토리: 캘린더 사용자로서, 반복 일정의 단일 인스턴스 또는 전체 인스턴스를 수정할지 선택하고 싶습니다, 필요할 때 전체 시리즈에 영향을 주지 않고 변경할 수 있도록. -->

---

## 2. Input → Output ⭐
<!-- 입력 → 출력 ⭐ -->

### Input (사용자 행동)
```
User Action:
1. Click "수정" button on a recurring event
2. Modify event details (e.g., title, time)
3. Click "저장" button
4. Dialog appears: "해당 일정만 수정하시겠어요?"
5. Choose "예" or "아니오"

Current State (Before):
- Recurring event: "주간 회의" (매주 월요일 10:00-11:00)
- 50 instances in the system
- All instances have repeat icon 🔁
```

### Process (변환 과정)

**Case A: User clicks "예" (Edit Single)**
```
1. Convert recurring instance to single event
2. Remove repeat metadata (type: 'none')
3. Remove ID (trigger POST to create new event)
4. Clear editingEvent state
5. Save as NEW single event via POST
6. Remove repeat icon from this instance
7. Original recurring event remains unchanged
```

**Case B: User clicks "아니오" (Edit All)**
```
1. Keep repeat metadata (type: 'weekly/daily/monthly/yearly')
2. Keep original event ID
3. Keep editingEvent state
4. Update original recurring event via PUT
5. All instances updated
6. Repeat icon maintained on all instances
```

### Output (예상 결과)

**After "예" (Edit Single)**:
```
After State:
- NEW event: "특별 회의" (2025-10-08 10:00-11:00) ← NO repeat icon
- Original recurring event: "주간 회의" still exists (49 instances remain)
- Repeat icon: Only on original recurring events

Expected Notification/Feedback:
- Success message: "일정이 저장되었습니다"
- Event list shows both events separately
```

**After "아니오" (Edit All)**:
```
After State:
- Updated recurring event: "팀 미팅" (매주 월요일 09:00-10:00)
- ALL 50 instances updated
- Repeat icon: Maintained on all instances

Expected Notification/Feedback:
- Success message: "일정이 저장되었습니다"
- All instances show updated information
```

### Example

**Scenario 1: Edit Single Instance**
```
Before:
- Event: "주간 회의" (2025-10-08 10:00-11:00, recurring weekly)
- Has repeat icon 🔁

Action:
1. Click "수정" on Oct 8th instance
2. Change title to "특별 회의"
3. Click "저장"
4. Dialog: "해당 일정만 수정하시겠어요?"
5. Click "예"

After:
- NEW event: "특별 회의" (2025-10-08 10:00-11:00, single event)
- NO repeat icon ❌🔁
- Original "주간 회의" still appears on Oct 15, 22, 29...
- Original instances still have repeat icon 🔁
```

**Scenario 2: Edit All Instances**
```
Before:
- Event: "주간 회의" (every Monday 10:00-11:00)
- 50 instances with repeat icon 🔁

Action:
1. Click "수정" on any instance
2. Change time to 09:00-10:00
3. Click "저장"
4. Dialog: "해당 일정만 수정하시겠어요?"
5. Click "아니오"

After:
- ALL 50 instances: "주간 회의" (every Monday 09:00-10:00)
- All instances still have repeat icon 🔁
- No new events created
```

---

## 3. Technical Requirements
<!-- 기술 요구사항 -->

### Prerequisites (⚠️ CRITICAL - MUST COMPLETE FIRST)
<!-- 전제조건 (필수 - 먼저 완료해야 함) -->

**MUST complete before implementation:**
<!-- 구현 전에 반드시 완료: -->

**A. Test Helper Utilities (HIGH PRIORITY 🔴)**

Create these files **BEFORE writing any tests**:

1. **`src/__tests__/fixtures/eventFixtures.ts`**
   - `getCurrentTestDate(dayOffset)` - Returns correct October 2025 dates
   - `createRecurringEvent(overrides)` - Factory for recurring events
   - `createNormalEvent(overrides)` - Factory for single events
   - `createDailyRecurringEvent(overrides)` - Factory for daily events
   - **Why**: Prevents date mismatches and ensures consistent test data

2. **`src/__tests__/helpers/mockHelpers.ts`**
   - `setupRecurringEventMocks(initialEvents)` - Complete MSW mock setup
   - Handles GET, POST, PUT, DELETE for events
   - Returns reference to mockEvents array for assertions
   - **Why**: Centralized mock management, prevents mock inconsistencies

3. **`src/__tests__/helpers/asyncHelpers.ts`**
   - `waitForDialog(title, timeout)` - Wait for dialog to appear
   - `handleOverlapDialogIfPresent(user)` - Handle overlap dialog if shown
   - `waitForEventInList(title, timeout)` - Wait for event in list
   - `waitForEventToDisappear(title, timeout)` - Wait for removal
   - `saveEventWithDialogHandling(user, options)` - Complete save workflow
   - **Why**: Handles all async state updates properly, prevents "element not found" errors

4. **`src/__tests__/helpers/domHelpers.ts`**
   - `findEventBoxByTitle(title)` - Find event box in list
   - `hasRepeatIcon(title)` - Check if event has repeat icon
   - `getEditButtonForEvent(index)` - Get edit button by index
   - **Why**: Works with Box structure (not `<tr>`), provides clear error messages

**B. MUST understand before coding:**

1. **Current Event Operations Flow**:
   ```typescript
   // In App.tsx
   const { events, saveEvent, deleteEvent } = useEventOperations(
     Boolean(editingEvent), // ← This determines POST vs PUT!
     () => setEditingEvent(null)
   );
   
   // In useEventOperations.ts
   if (editing) {
     // PUT: Uses originalEventId or event.id
     await fetch(`/api/events/${updateId}`, { method: 'PUT', ... });
   } else {
     // POST: Creates new event
     await fetch('/api/events', { method: 'POST', ... });
   }
   ```

2. **ID Management Critical Rules**:
   - **Single Edit**: Must clear `editingEvent` → triggers POST (new event)
   - **All Edit**: Keep `editingEvent` → triggers PUT (update existing)
   - Virtual IDs from `generateRecurringEvents()` must be removed for single edit

3. **Dialog Flow**:
   - Current: Save → Overlap Check → Edit Options Dialog → Another Overlap Check
   - Complex and causes test failures
   - **Solution**: Check overlap BEFORE showing Edit Options Dialog

### Data Model Changes

**No changes to Event interface** - existing structure supports this feature:
```typescript
interface Event {
  id: string;
  // ... other fields
  repeat: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
    originalEventId?: string; // ← Used for recurring events
  };
}
```

### UI Components

**Components to create:**
- [x] `EditOptionsDialog.tsx` - Already exists (created in previous attempt)
  - Shows "해당 일정만 수정하시겠어요?" question
  - Three buttons: "예", "아니오", "취소"
  - Unit tests passed ✅ (6/6)

**Components to modify:**
- [ ] `App.tsx`
  - Import `EditOptionsDialog`
  - Add state: `isEditOptionsDialogOpen`, `pendingEventData`
  - Modify `addOrUpdateEvent()` to check if editing recurring event
  - Add handlers: `handleEditSingle()`, `handleEditAll()`, `handleCloseEditOptions()`
  - Render `EditOptionsDialog`

### API/Storage Changes

**No API changes needed** - existing endpoints support this:
- `POST /api/events` - Create new single event (for "예")
- `PUT /api/events/:id` - Update recurring event (for "아니오")

**Critical**: ID management determines which endpoint is called:
- **Single Edit**: Remove ID → POST (new event)
- **All Edit**: Keep ID → PUT (update existing)

---

## 4. Implementation Checklist
<!-- 구현 체크리스트 -->

### Phase 0: Prerequisites (MUST DO FIRST) 🔴
<!-- 0단계: 전제조건 (먼저 수행) -->

**Before writing ANY implementation code:**

- [ ] Create `src/__tests__/fixtures/eventFixtures.ts`
  - [ ] `getCurrentTestDate()`
  - [ ] `createRecurringEvent()`
  - [ ] `createNormalEvent()`
  - [ ] `createDailyRecurringEvent()`
  
- [ ] Create `src/__tests__/helpers/mockHelpers.ts`
  - [ ] `setupRecurringEventMocks()`
  - [ ] Test: Verify mock handlers work correctly
  
- [ ] Create `src/__tests__/helpers/asyncHelpers.ts`
  - [ ] `waitForDialog()`
  - [ ] `handleOverlapDialogIfPresent()`
  - [ ] `waitForEventInList()`
  - [ ] `waitForEventToDisappear()`
  - [ ] `saveEventWithDialogHandling()`
  
- [ ] Create `src/__tests__/helpers/domHelpers.ts`
  - [ ] `findEventBoxByTitle()`
  - [ ] `hasRepeatIcon()`
  - [ ] `getEditButtonForEvent()`

**Verification**: Run a simple test using these helpers to confirm they work

---

### Phase 1: TDD - Component (Already Done ✅)
<!-- 1단계: TDD - 컴포넌트 (완료) -->

**Component**: `EditOptionsDialog.tsx`

- [x] RED: Write unit tests for dialog
  - [x] Dialog renders when open
  - [x] Dialog doesn't render when closed
  - [x] "예" button triggers `onEditSingle`
  - [x] "아니오" button triggers `onEditAll`
  - [x] "취소" button triggers `onClose`
  - [x] All buttons render in correct order

- [x] GREEN: Implement dialog component (minimal)
  - [x] Material-UI Dialog
  - [x] Three buttons with correct handlers
  - [x] Clean TypeScript interface

- [x] Tests: **6/6 passed** ✅

**Status**: ✅ Complete (from previous attempt)

---

### Phase 2: TDD - Integration (Edit Single)
<!-- 2단계: TDD - 통합 (단일 수정) -->

**Feature**: Edit single instance of recurring event

- [ ] RED: Write integration test
  ```typescript
  it('반복 일정 단일 수정 시 일반 일정으로 변환된다', async () => {
    // Use fixtures
    const recurringEvent = createRecurringEvent({ title: '주간 회의' });
    setupRecurringEventMocks([recurringEvent]);
    
    // Edit event
    await user.click(editButtons[0]);
    await user.clear(titleInput);
    await user.type(titleInput, '특별 회의');
    
    // Use helper to handle complete flow
    await saveEventWithDialogHandling(user, {
      editOptionsChoice: 'single',
      handleOverlap: true,
    });
    
    // Verify: New single event created
    const newEvent = await waitForEventInList('특별 회의');
    expect(newEvent).toBeInTheDocument();
    
    // Verify: No repeat icon on single event
    expect(hasRepeatIcon('특별 회의')).toBe(false);
    
    // Verify: Original recurring event still exists
    expect(hasRepeatIcon('주간 회의')).toBe(true);
  });
  ```

- [ ] GREEN: Implement `handleEditSingle()` in App.tsx
  ```typescript
  const handleEditSingle = async () => {
    if (!pendingEventData) return;
  
    // Remove ID and repeat metadata to create NEW event
    const { id, repeat, ...eventWithoutIdAndRepeat } = pendingEventData as Event;
  
    const singleEventData: EventForm = {
      ...eventWithoutIdAndRepeat,
      repeat: { type: 'none', interval: 0 },
    };
  
    setIsEditOptionsDialogOpen(false);
    setPendingEventData(null);
    
    // CRITICAL: Clear editingEvent so useEventOperations uses POST
    setEditingEvent(null);
  
    await saveEvent(singleEventData);
    resetForm();
  };
  ```

- [ ] REFACTOR: Extract repeated logic if needed

---

### Phase 3: TDD - Integration (Edit All)
<!-- 3단계: TDD - 통합 (전체 수정) -->

**Feature**: Edit all instances of recurring event

- [ ] RED: Write integration test
  ```typescript
  it('반복 일정 전체 수정 시 모든 인스턴스가 업데이트된다', async () => {
    const recurringEvent = createRecurringEvent({ title: '주간 회의' });
    setupRecurringEventMocks([recurringEvent]);
    
    await user.click(editButtons[0]);
    await user.clear(titleInput);
    await user.type(titleInput, '팀 미팅');
    
    await saveEventWithDialogHandling(user, {
      editOptionsChoice: 'all',
      handleOverlap: true,
    });
    
    // Verify: All instances updated
    const updatedEvent = await waitForEventInList('팀 미팅');
    expect(updatedEvent).toBeInTheDocument();
    
    // Verify: Repeat icon maintained
    expect(hasRepeatIcon('팀 미팅')).toBe(true);
    
    // Verify: Old title gone
    await waitForEventToDisappear('주간 회의');
  });
  ```

- [ ] GREEN: Implement `handleEditAll()` in App.tsx
  ```typescript
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

- [ ] REFACTOR: Clean up code

---

### Phase 4: TDD - Normal Event (No Dialog)
<!-- 4단계: TDD - 일반 일정 (다이얼로그 없음) -->

**Feature**: Normal events should NOT show Edit Options Dialog

- [ ] RED: Write integration test
  ```typescript
  it('일반 일정 수정 시 다이얼로그가 표시되지 않는다', async () => {
    const normalEvent = createNormalEvent({ title: '단일 미팅' });
    setupRecurringEventMocks([normalEvent]);
    
    await user.click(editButtons[0]);
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 미팅');
    await user.click(submitButton);
    
    // Dialog should NOT appear
    expect(screen.queryByText('해당 일정만 수정하시겠어요?')).not.toBeInTheDocument();
    
    // Event saved directly
    const updatedEvent = await waitForEventInList('수정된 미팅');
    expect(updatedEvent).toBeInTheDocument();
  });
  ```

- [ ] GREEN: Modify trigger condition in `addOrUpdateEvent()`
  ```typescript
  // Only show dialog for RECURRING events
  if (editingEvent && editingEvent.repeat.type !== 'none') {
    setPendingEventData(eventData);
    setIsEditOptionsDialogOpen(true);
    return;
  }
  
  // Normal events: save directly
  await saveEvent(eventData);
  ```

---

### Error Prevention (Based on Previous Failure) ⚠️
<!-- 오류 방지 (이전 실패 기반) -->

**Before each step:**

- [ ] **Check test data dates**: Use `getCurrentTestDate()` - never hardcode dates
- [ ] **Use async helpers**: Never use immediate queries after state changes
- [ ] **Verify mock setup**: Call `setupRecurringEventMocks()` in every test
- [ ] **Clear state properly**: Call `setEditingEvent(null)` for single edit

**Known Pitfalls:**

- ⚠️ **Pitfall 1: Date Mismatch**
  - Problem: Hardcoding `date: '2025-01-08'` when system is October
  - Solution: Always use `getCurrentTestDate(dayOffset)`
  
- ⚠️ **Pitfall 2: Immediate Query After Save**
  - Problem: `await user.click(button); const event = getByText('...');` fails
  - Solution: Use `await waitForEventInList('...')`
  
- ⚠️ **Pitfall 3: DOM Query on `<tr>`**
  - Problem: `closest('tr')` returns null (Box structure, not table)
  - Solution: Use `findEventBoxByTitle()` helper
  
- ⚠️ **Pitfall 4: Forgot to Clear editingEvent**
  - Problem: Single edit uses PUT instead of POST
  - Solution: `setEditingEvent(null)` in `handleEditSingle()`
  
- ⚠️ **Pitfall 5: Multiple Dialogs Confusion**
  - Problem: Edit Options Dialog → Overlap Dialog (unexpected second dialog)
  - Solution: Use `handleOverlapDialogIfPresent()` after edit choice

---

### Must Have (필수)

- [ ] "해당 일정만 수정하시겠어요?" dialog appears when editing recurring event
- [ ] "예" button converts to single event (removes repeat icon)
- [ ] "아니오" button updates all instances (keeps repeat icon)
- [ ] "취소" button closes dialog without changes
- [ ] Normal events do NOT show dialog
- [ ] Single edit creates NEW event via POST
- [ ] All edit updates original via PUT

### Nice to Have (선택)

- [ ] Show count of affected instances in dialog ("50개 일정이 수정됩니다")
- [ ] Keyboard shortcuts (Enter = "예", Esc = "취소")
- [ ] Loading indicator during save

### Edge Cases to Handle

- [ ] User clicks "예" but has overlap → Show overlap dialog
- [ ] User clicks "아니오" but has overlap → Show overlap dialog
- [ ] User clicks "취소" → Close dialog, return to edit form
- [ ] Deleting recurring event → Separate feature (not in this scope)
- [ ] First occurrence of recurring event → Should still show dialog
- [ ] Last occurrence of recurring event → Should still show dialog

---

## 5. Success Criteria
<!-- 성공 기준 -->

**Feature is complete when:**

- [ ] All "Must Have" items work correctly
- [ ] Input → Output matches specification exactly
  - "예" → New single event, no icon
  - "아니오" → All instances updated, icon maintained
- [ ] Edge cases handled properly
- [ ] All tests pass (component + integration)
  - Component tests: 6/6 ✅ (already done)
  - Integration tests: 3/3 ✅ (to be written)
- [ ] Code follows .cursorrules
  - TypeScript with no `any`
  - camelCase functions
  - snake_case CSS classes
  - Prettier/ESLint pass
- [ ] No regressions in existing features
  - Normal event edit still works
  - Delete still works
  - Overlap checking still works

**Acceptance Tests**:
```typescript
✅ Edit recurring event → Dialog appears
✅ Click "예" → Single event created, no icon
✅ Click "아니오" → All instances updated, icon remains
✅ Edit normal event → No dialog, saves directly
✅ All existing tests still pass
```

---

## 6. Questions/Concerns
<!-- 질문/우려사항 -->

**Unclear points:**
- ✅ Dialog text confirmed: "해당 일정만 수정하시겠어요?"
- ✅ Button labels confirmed: "예", "아니오", "취소"

**Potential issues:**
- ⚠️ **Dialog sequence complexity**: Edit Options → Overlap Check might confuse users
  - **Mitigation**: Consider combining dialogs (show overlap warning IN Edit Options Dialog)
  - **Alternative**: Check overlap BEFORE showing Edit Options Dialog
- ⚠️ **Performance**: Updating 1000+ recurring instances
  - **Current scope**: Accept current performance (no optimization yet)
- ⚠️ **Previously singularized instances**: If user already edited one instance before, should it be affected by "아니오"?
  - **Current scope**: No - singularized instances remain independent

---

## 8. Known Issues & Solutions
<!-- 알려진 문제 및 해결책 -->

**These issues were discovered in previous attempt. Solutions are MANDATORY.**

### Issue 1: Test Data Date Mismatches
**Symptom**: Tests create events with date `2025-01-08` but system shows October 2025
**Root Cause**: Hardcoded dates in test fixtures
**Solution**: 
```typescript
// ✅ GOOD: Use fixture factory
const event = createRecurringEvent({
  date: getCurrentTestDate(7), // Always correct month
});

// ❌ BAD: Hardcoded date
const event = { date: '2025-01-08' }; // Wrong month!
```

### Issue 2: Async State Update Timing
**Symptom**: `Unable to find element: 특별 회의` after clicking save
**Root Cause**: Test queries immediately, before state update completes
**Solution**:
```typescript
// ✅ GOOD: Wait for element with helper
const event = await waitForEventInList('특별 회의');

// ❌ BAD: Immediate query
const event = screen.getByText('특별 회의'); // Fails - too fast
```

### Issue 3: DOM Query Strategy
**Symptom**: `closest('tr')` returns null
**Root Cause**: Event list uses `Box` components, not `<table>`
**Solution**:
```typescript
// ✅ GOOD: Use helper
const eventBox = findEventBoxByTitle('특별 회의');
const hasIcon = hasRepeatIcon('특별 회의');

// ❌ BAD: Assumes table structure
const row = element.closest('tr'); // Returns null
```

### Issue 4: Multiple Dialogs Confusion
**Symptom**: After Edit Options Dialog, unexpected Overlap Dialog appears
**Root Cause**: Sequential dialogs not properly handled in tests
**Solution**:
```typescript
// ✅ GOOD: Use complete workflow helper
await saveEventWithDialogHandling(user, {
  editOptionsChoice: 'single',
  handleOverlap: true, // Handles overlap dialog automatically
});

// ❌ BAD: Handle Edit Options only
await user.click(yesButton);
// Misses overlap dialog handling
```

### Issue 5: ID Management (POST vs PUT)
**Symptom**: Single edit uses PUT instead of POST (doesn't create new event)
**Root Cause**: `editingEvent` still set, so `useEventOperations` uses PUT
**Solution**:
```typescript
// ✅ GOOD: Clear editingEvent for single edit
const handleEditSingle = async () => {
  // ... prepare data
  setEditingEvent(null); // ← CRITICAL: Forces POST
  await saveEvent(singleEventData);
};

// ✅ GOOD: Keep editingEvent for all edit
const handleEditAll = async () => {
  // editingEvent still set → Uses PUT
  await saveEvent(pendingEventData);
};
```

---

## User Confirmation
<!-- 사용자 컨펌 -->

**Status**: ⏳ Awaiting user confirmation
<!-- 상태: 사용자 컨펌 대기 중 -->

**User Comments**:
```
[사용자 피드백 작성 공간]
```

**Final Decision**: 
- [ ] ✅ Approved - Proceed with implementation
- [ ] 🔄 Revise - Need changes (specify below)
- [ ] ❌ Rejected - Do not implement

**Revision Notes** (if applicable):
```
[수정 필요 사항]
```

---

**Request Document Version**: 1.0 (2025-10-29)
<!-- Request 문서 버전: 1.0 (2025-10-29) -->

**Based on PRD Template**: v4.0 (with Error Recovery Process)
<!-- PRD 템플릿 기반: v4.0 (오류 복구 프로세스 포함) -->

