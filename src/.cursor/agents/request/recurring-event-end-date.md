# Feature Request: Recurring Event End Date
<!-- 기능 요청: 반복 일정 종료 날짜 -->

**Date**: 2025-10-29
**Requester**: User/King
**Status**: ⏳ Pending Review

---

## 1. Feature Overview
<!-- 기능 개요 -->

**What**: Add ability to set an end date for recurring events, after which the event will no longer appear in the calendar
<!-- 무엇을: 반복 일정에 종료 날짜를 설정하여, 해당 날짜 이후에는 캘린더에 표시되지 않도록 하는 기능 -->

**Why**: Users need to create temporary recurring events (e.g., "weekly meeting for 3 months"). Currently, all recurring events continue indefinitely, making it difficult to manage time-limited recurring schedules.
<!-- 왜: 사용자는 일시적인 반복 일정을 만들어야 합니다 (예: "3개월간 매주 회의"). 현재는 모든 반복 일정이 무한정 계속되어 기한이 있는 반복 일정 관리가 어렵습니다. -->

**User Story**: As a calendar user, I want to set an end date for recurring events, so that the event automatically stops appearing in my calendar after that date without manual deletion.
<!-- 사용자 스토리: 캘린더 사용자로서, 반복 일정에 종료 날짜를 설정하고 싶습니다. 그래서 해당 날짜 이후에는 수동 삭제 없이 자동으로 캘린더에 표시되지 않도록 하고 싶습니다. -->

---

## 2. Input → Output ⭐
<!-- 입력 → 출력 ⭐ -->

### Current Behavior (Before Implementation)
<!-- 현재 동작 (구현 전) -->

```
User Interface:
┌─────────────────────────────┐
│ ☑ 반복 일정                  │
│ [반복 유형: 매주 ▼]          │
│                              │  ← No end date option
│ [일정 추가 버튼]              │
└─────────────────────────────┘

Resulting Events (Infinite):
2025-10-01 주간 회의 ✓
2025-10-08 주간 회의 ✓
2025-10-15 주간 회의 ✓
2025-10-22 주간 회의 ✓
...
2026-01-07 주간 회의 ✓
2026-01-14 주간 회의 ✓
... (continues forever) ❌

Problem: User must manually delete event later
```

### Desired Behavior (After Implementation)
<!-- 원하는 동작 (구현 후) -->

```
User Interface:
┌─────────────────────────────┐
│ ☑ 반복 일정                  │
│ [반복 유형: 매주 ▼]          │
│ [반복 종료 날짜: 2025-12-31] │  ← NEW: End date field
│ [일정 추가 버튼]              │
└─────────────────────────────┘

Resulting Events (Limited):
2025-10-01 주간 회의 ✓
2025-10-08 주간 회의 ✓
...
2025-12-24 주간 회의 ✓
2025-12-31 주간 회의 ✓ (Last occurrence)
2026-01-07 (Not displayed) ✅
2026-01-14 (Not displayed) ✅

Solution: Events automatically stop after end date
```

### Input (사용자 행동)

**Scenario 1: Creating New Recurring Event with End Date**
```
User Actions:
1. Click "일정 추가" button
2. Fill in event details (title, date, time, etc.)
3. Check "반복 일정" checkbox
4. Select repeat type: "매주"
5. Select end date: "2025-12-31" (NEW STEP)
6. Click "일정 추가" to save

Current State (Before):
- Modal form open
- "반복 일정" checked
- "반복 유형" shows dropdown
- No end date field visible
```

**Scenario 2: Editing Existing Recurring Event to Add End Date**
```
User Actions:
1. Click "수정" button on recurring event
2. Modal opens with existing data
3. "반복 종료 날짜" field shows current value (empty or existing date)
4. Change end date to "2025-12-31"
5. Click "일정 추가" to save

Current State (Before):
- Modal form open in edit mode
- Existing repeat settings loaded
```

**Scenario 3: Removing End Date (Make Infinite Again)**
```
User Actions:
1. Edit recurring event
2. Clear the "반복 종료 날짜" field (leave empty)
3. Save

Expected: Event becomes infinite again
```

### Process (변환 과정)

```
1. Form Validation:
   - If end date is set, verify it's >= event start date
   - Show error if end date is before start date

2. Data Storage:
   - Save repeatEndDate to event.repeat.endDate field
   - If field is empty, set to undefined (infinite)

3. Rendering Logic (recurringEventUtils.ts):
   - When generating recurring instances:
     a. For each potential occurrence date:
     b. If event.repeat.endDate exists:
        - Compare occurrence date with endDate
        - If occurrence date > endDate: SKIP (don't render)
        - If occurrence date <= endDate: RENDER
     c. If event.repeat.endDate is undefined: RENDER (infinite)

4. Calendar Display:
   - Week View: Apply end date filter
   - Month View: Apply end date filter
   - Event List: Apply end date filter
```

### Output (예상 결과)

```
After State (Scenario 1):
{
  id: "event-123",
  title: "주간 회의",
  date: "2025-10-01",
  startTime: "10:00",
  endTime: "11:00",
  repeat: {
    type: "weekly",
    interval: 1,
    endDate: "2025-12-31"  // ← NEW FIELD POPULATED
  },
  // ... other fields
}

Calendar Display:
- Shows events from 2025-10-01 to 2025-12-31 only
- After 2025-12-31, no more instances appear
- Event still exists in database (can be edited to extend)

Expected Notification/Feedback:
✅ "반복 일정이 추가되었습니다. (2025-12-31까지 반복)"
```

### Example: Real-World Use Case
<!-- 예시: 실제 사용 사례 -->

```
Before (Current System):
User creates: "매주 화요일 요가 수업"
Start: 2025-10-01
Repeat: Weekly
End Date: (not available)

Result: Event continues forever
Problem: User signs up for 3-month yoga class only
         Must manually delete later ❌

After (With End Date Feature):
User creates: "매주 화요일 요가 수업"
Start: 2025-10-01
Repeat: Weekly
End Date: 2025-12-31 ✅

Result: Event automatically stops after 2025-12-31
Solution: Perfectly matches real-world schedule ✅
```

---

## 3. Technical Requirements
<!-- 기술 요구사항 -->

### Prerequisites
<!-- 전제 조건 -->

**Existing Code Analysis:**
- [ ] Check `useEventForm.ts` - `repeatEndDate` state already exists
- [ ] Check `types.ts` - `RepeatInfo.endDate` already defined
- [ ] Check `recurringEventUtils.ts` - understand recurring event generation logic
- [ ] Check `App.tsx` - locate event form modal to add new field

**Key Finding:**
The `endDate` field already exists in the type system but is not used:
```typescript
// types.ts (already exists)
export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string; // ← Already defined, just not implemented
}
```

### Data Model (No Changes Needed)
<!-- 데이터 모델 (변경 불필요) -->

```typescript
// types.ts - ALREADY EXISTS, just confirming
export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string; // ISO date string (YYYY-MM-DD)
                    // Optional: undefined = infinite repeat
}
```

### UI Components
<!-- UI 컴포넌트 -->

**Component to Modify:** `App.tsx` - Event Form Modal

**New UI Element:**
```tsx
{/* Add after "반복 유형" dropdown */}
{isRepeating && (
  <FormControl fullWidth>
    <FormLabel htmlFor="repeat-end-date">반복 종료 날짜</FormLabel>
    <TextField
      id="repeat-end-date"
      type="date"
      size="small"
      value={repeatEndDate || ''}
      onChange={(e) => setRepeatEndDate(e.target.value || undefined)}
      InputLabelProps={{ shrink: true }}
    />
  </FormControl>
)}
```

**Design Requirements:**
- Same visual style as "반복 유형" dropdown
- Only visible when "반복 일정" checkbox is checked
- Optional field (can be left empty for infinite repeat)
- Use Material-UI TextField with type="date"
- Placeholder or helper text: "(선택사항: 비워두면 무한 반복)"

### Logic Changes
<!-- 로직 변경 -->

**File:** `src/utils/recurringEventUtils.ts`

**Function to Modify:** `generateRecurringEvents()` or similar

**New Logic:**
```typescript
// Before generating each instance
if (event.repeat.endDate) {
  const endDate = new Date(event.repeat.endDate);
  const instanceDate = new Date(occurrenceDate);
  
  // Compare dates only (ignore time)
  endDate.setHours(0, 0, 0, 0);
  instanceDate.setHours(0, 0, 0, 0);
  
  if (instanceDate > endDate) {
    continue; // Skip this instance - after end date
  }
}
// Otherwise, generate instance normally
```

### Validation Rules
<!-- 검증 규칙 -->

```typescript
// In event form submission
if (isRepeating && repeatEndDate) {
  const startDate = new Date(date);
  const endDate = new Date(repeatEndDate);
  
  if (endDate < startDate) {
    // Show error: "종료 날짜는 시작 날짜 이후여야 합니다"
    return;
  }
}
```

---

## 4. Implementation Checklist
<!-- 구현 체크리스트 -->

### Phase 0: Prerequisites ⚠️
<!-- 0단계: 전제 조건 ⚠️ -->

- [ ] Read and understand `useEventForm.ts`
  - Confirm `repeatEndDate` state exists
  - Confirm `setRepeatEndDate` function exists
- [ ] Read and understand `recurringEventUtils.ts`
  - Identify where recurring instances are generated
  - Understand how to filter instances
- [ ] Read and understand `App.tsx` event form
  - Locate where "반복 유형" dropdown is rendered
  - Confirm form layout and styling

### Phase 1: UI Implementation (TDD)
<!-- 1단계: UI 구현 (TDD) -->

**RED:**
- [ ] Write test: "반복 일정 체크 시 '반복 종료 날짜' 필드가 표시된다"
- [ ] Write test: "반복 일정 체크 해제 시 '반복 종료 날짜' 필드가 숨겨진다"
- [ ] Run tests → FAIL ❌

**GREEN:**
- [ ] Add TextField for `repeatEndDate` in `App.tsx`
- [ ] Show/hide based on `isRepeating` state
- [ ] Connect to `repeatEndDate` and `setRepeatEndDate`
- [ ] Run tests → PASS ✅

**REFACTOR:**
- [ ] Ensure consistent styling with existing form fields
- [ ] Add proper labels and accessibility attributes
- [ ] Add helper text: "(선택사항)"

### Phase 2: Form State & Validation (TDD)
<!-- 2단계: 폼 상태 및 검증 (TDD) -->

**RED:**
- [ ] Write test: "종료 날짜 입력 시 상태가 업데이트된다"
- [ ] Write test: "종료 날짜가 시작 날짜보다 이전이면 에러 표시"
- [ ] Write test: "종료 날짜 비워두면 undefined로 저장"
- [ ] Run tests → FAIL ❌

**GREEN:**
- [ ] Implement `onChange` handler for end date field
- [ ] Add validation logic for end date >= start date
- [ ] Handle empty field → undefined (infinite repeat)
- [ ] Show validation error message if needed
- [ ] Run tests → PASS ✅

**REFACTOR:**
- [ ] Extract validation into helper function
- [ ] Improve error message UX

### Phase 3: Rendering Logic (TDD)
<!-- 3단계: 렌더링 로직 (TDD) -->

**RED:**
- [ ] Write test: "종료 날짜 이후의 반복 일정이 표시되지 않는다"
- [ ] Write test: "종료 날짜 이전의 반복 일정은 표시된다"
- [ ] Write test: "종료 날짜가 없으면 무한 반복된다"
- [ ] Write test: "종료 날짜 당일의 일정은 표시된다 (경계값)"
- [ ] Run tests → FAIL ❌

**GREEN:**
- [ ] Modify `recurringEventUtils.ts` to check `endDate`
- [ ] Add filtering logic for each recurring instance
- [ ] Handle undefined `endDate` (infinite repeat)
- [ ] Run tests → PASS ✅

**REFACTOR:**
- [ ] Optimize date comparison logic
- [ ] Add comments explaining boundary conditions
- [ ] Consider performance for large date ranges

### Phase 4: Integration Tests
<!-- 4단계: 통합 테스트 -->

**Week View:**
- [ ] Create recurring event with end date "2025-12-31"
- [ ] Navigate to December 2025 → event visible
- [ ] Navigate to January 2026 → event NOT visible ✅

**Month View:**
- [ ] Same recurring event
- [ ] December 2025 month view → event visible
- [ ] January 2026 month view → event NOT visible ✅

**Event List:**
- [ ] Verify event list respects end date filter
- [ ] Only shows instances within date range

**Edit Functionality:**
- [ ] Edit event to add end date → saves correctly
- [ ] Edit event to remove end date → becomes infinite
- [ ] Edit event to change end date → updates calendar

### Phase 5: Edge Cases
<!-- 5단계: 엣지 케이스 -->

- [ ] End date = start date (should show 1 occurrence only)
- [ ] Very long end date (2050-12-31) - performance check
- [ ] Past end date (event already ended) - should not show any instances
- [ ] Edit to extend end date (2025-12-31 → 2026-06-30) - should show new instances

---

## 5. Success Criteria
<!-- 성공 기준 -->

### Must Have (필수)
<!-- 필수 기능 -->

- [ ] **UI Visible**: "반복 종료 날짜" field appears when "반복 일정" is checked
- [ ] **UI Hidden**: Field disappears when "반복 일정" is unchecked
- [ ] **Data Save**: End date is saved to `event.repeat.endDate` field
- [ ] **Rendering**: Events after end date do NOT appear in calendar
- [ ] **Infinite Repeat**: Leaving field empty maintains infinite repeat behavior
- [ ] **Validation**: Error message if end date < start date
- [ ] **Week View**: End date filtering works correctly
- [ ] **Month View**: End date filtering works correctly
- [ ] **Event Edit**: Can modify end date on existing events
- [ ] **All Tests Pass**: 100% test coverage for new feature
- [ ] **TypeScript**: No type errors
- [ ] **Existing Features**: No regression in other calendar features

### Should Have (권장)
<!-- 권장 기능 -->

- [ ] Helper text: "(선택사항: 비워두면 무한 반복)"
- [ ] Visual feedback when end date is set (e.g., badge on event)
- [ ] Warning when creating event with past end date

### Nice to Have (추가)
<!-- 추가 기능 -->

- [ ] Quick preset buttons: "1개월", "3개월", "6개월", "1년"
- [ ] Show remaining occurrences count: "이 일정은 12번 더 반복됩니다"
- [ ] Confirmation dialog when setting very long end dates

---

## 6. Error Prevention
<!-- 오류 예방 -->

Based on previous recurring event implementations, watch out for:

### Common Pitfalls (과거 경험 기반)
<!-- 일반적인 함정 (과거 경험 기반) -->

1. **Date Comparison Issues**
   - Problem: Comparing dates with time components
   - Solution: Normalize to midnight (00:00:00) before comparing
   ```typescript
   // WRONG
   if (instanceDate > endDate) // includes time
   
   // RIGHT
   instanceDate.setHours(0, 0, 0, 0);
   endDate.setHours(0, 0, 0, 0);
   if (instanceDate > endDate) // date only
   ```

2. **Boundary Value Errors**
   - Problem: End date = start date shows 0 occurrences
   - Solution: Use `>` not `>=` for comparison
   ```typescript
   // WRONG
   if (instanceDate >= endDate) continue;
   
   // RIGHT
   if (instanceDate > endDate) continue; // includes end date
   ```

3. **Form Reset Issues**
   - Problem: End date persists after unchecking "반복 일정"
   - Solution: Reset `repeatEndDate` when `isRepeating` becomes false

4. **Type Safety**
   - Problem: Mixing string and Date types
   - Solution: Convert consistently, handle undefined
   ```typescript
   const endDate = event.repeat.endDate 
     ? new Date(event.repeat.endDate) 
     : null;
   ```

5. **Performance**
   - Problem: Generating infinite instances before filtering
   - Solution: Check end date BEFORE generating expensive instances

---

## 7. Related Files
<!-- 관련 파일 -->

### Files to Modify
<!-- 수정할 파일 -->

1. **`src/App.tsx`** (UI Addition)
   - Add "반복 종료 날짜" TextField
   - Lines to modify: ~450-500 (Event Form Modal)

2. **`src/utils/recurringEventUtils.ts`** (Logic Addition)
   - Add end date filtering logic
   - Function: `generateRecurringEvents()` or similar

3. **`src/__tests__/medium.integration.spec.tsx`** (Tests)
   - Add integration tests for end date feature

### Files to Reference (No Changes)
<!-- 참조할 파일 (변경 없음) -->

1. **`src/types.ts`**
   - Confirm `RepeatInfo.endDate` type definition

2. **`src/hooks/useEventForm.ts`**
   - Confirm `repeatEndDate` state management

3. **`src/.cursor/agents/review/2025-10-29_recurring-event-edit-options-attempt.md`**
   - Learn from previous recurring event implementation

---

## 8. Known Issues & Solutions
<!-- 알려진 이슈 및 해결책 -->

(To be populated if Error Recovery Process is triggered during implementation)
<!-- Error Recovery Process가 실행되면 채워집니다 -->

---

## Appendix: User Experience Flow
<!-- 부록: 사용자 경험 흐름 -->

### Flow 1: Create Recurring Event with End Date
```
1. User clicks "일정 추가"
2. Fills title: "주간 회의"
3. Selects date: "2025-10-01"
4. Checks "반복 일정" ☑
   → "반복 유형" dropdown appears
   → "반복 종료 날짜" field appears ✨
5. Selects "매주" from dropdown
6. Selects "2025-12-31" in end date field
7. Clicks "일정 추가"
8. Success message: "반복 일정이 추가되었습니다. (2025-12-31까지 반복)"
9. Calendar shows events from Oct to Dec 2025 only ✅
```

### Flow 2: Create Infinite Recurring Event
```
1. User clicks "일정 추가"
2. Checks "반복 일정" ☑
3. Selects repeat type
4. Leaves "반복 종료 날짜" empty
5. Clicks "일정 추가"
6. Calendar shows infinite recurring events ✅ (existing behavior maintained)
```

### Flow 3: Extend Recurring Event
```
1. User has event ending "2025-12-31"
2. Decides to extend to "2026-06-30"
3. Clicks "수정" on any instance
4. Changes end date to "2026-06-30"
5. Clicks "일정 추가"
6. Calendar now shows events until June 2026 ✅
```

---

**PRD Template Version**: 4.0 (2025-10-29 - Error Recovery Process)
**Document Status**: Ready for King's Quality Gate Review

