# Code Review Report: Yearly Recurring Event Delete Bug
<!-- 코드 리뷰 보고서: 매년 반복 일정 삭제 버그 -->

**Date**: 2025-10-29
**Reviewer**: Feedback (관리자)
**Task**: Debug yearly recurring event deletion failure
**Status**: ⚠️ INVESTIGATION IN PROGRESS

---

## 1. Bug Report
<!-- 버그 보고 -->

**User Report**:
<!-- 사용자 보고: -->
```
Steps to Reproduce:
1. Create yearly recurring event on 2025-10-25
2. Navigate to 2026-10-25
3. Click delete on the 2026-10-25 instance
4. Select "예" (delete single instance)
5. Result: Event is NOT deleted
```

**Expected Behavior**:
<!-- 예상 동작: -->
- 2026-10-25 instance should be deleted
- Other instances (2025-10-25, 2027-10-25, etc.) should remain

**Actual Behavior**:
<!-- 실제 동작: -->
- 2026-10-25 instance is NOT deleted
- Event remains visible after delete attempt

---

## 2. Initial Code Analysis
<!-- 초기 코드 분석 -->

### Deletion Logic (App.tsx)
```typescript
const handleDeleteSingle = async () => {
  if (!eventToDelete) return;

  // For instance model: delete only this specific event instance
  // <!-- 인스턴스 모델: 이 특정 이벤트 인스턴스만 삭제 -->
  await deleteEvent(eventToDelete.id);

  setIsDeleteOptionsDialogOpen(false);
  setEventToDelete(null);
};
```

**Analysis**: Code looks correct - it calls `deleteEvent` with the event's ID.

### Delete Event Function (useEventOperations.ts)
```typescript
const deleteEvent = async (id: string) => {
  try {
    // Simply delete the ID provided - no transformation needed
    // <!-- 제공된 ID만 삭제 - 변환 불필요 -->
    const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }

    await fetchEvents();
    enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
  } catch (error) {
    console.error('Error deleting event:', error);
    enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
  }
};
```

**Analysis**: Implementation is straightforward and correct.

---

## 3. Hypothesis: Yearly Recurrence Generation Issue
<!-- 가설: 매년 반복 생성 문제 -->

### Check generateRecurringEvents for yearly type

**File**: `src/utils/recurringEventUtils.ts`

**Code**:
```typescript
export function generateRecurringEvents(event: Event, maxOccurrences = 365): Event[] {
  // ...
  
  if (event.repeat.type === 'yearly') {
    currentDate = getYearlyOccurrence(startDate, iterationCount, event.repeat.interval);
  }
  
  // ...
}
```

**Question**: Does `getYearlyOccurrence` correctly generate 2026-10-25 from 2025-10-25?

### Need to Check:
<!-- 확인 필요: -->
1. Is 2026-10-25 instance actually created in DB?
2. Does it have a unique ID?
3. Is the ID correct in the UI when clicking delete?
4. Does the DELETE request actually get sent?
5. Does the backend delete the record?

---

## 4. Potential Root Causes
<!-- 잠재적 근본 원인 -->

### Cause A: Frontend Generation Issue
<!-- 원인 A: 프론트엔드 생성 문제 -->

**Hypothesis**: `getYearlyOccurrence` might have a bug for certain dates (e.g., 10/25)

**Test**: Create yearly event on different dates:
- 2025-01-01 → 2026-01-01 (works?)
- 2025-10-25 → 2026-10-25 (fails?)
- 2025-12-31 → 2026-12-31 (works?)

**Check**: `getYearlyOccurrence` implementation

### Cause B: ID Mismatch
<!-- 원인 B: ID 불일치 -->

**Hypothesis**: Generated instances might not have unique IDs or IDs don't match

**Check**:
1. Console log `eventToDelete.id` before delete
2. Check if ID exists in `events` array
3. Verify backend receives correct ID

### Cause C: Backend API Issue
<!-- 원인 C: 백엔드 API 문제 -->

**Hypothesis**: `/api/events/:id` DELETE might fail silently for certain IDs

**Check**:
1. Network tab: Is DELETE request sent?
2. Response status: 204 (success) or error?
3. Backend logs: Does record get deleted?

### Cause D: Date-Specific Edge Case
<!-- 원인 D: 날짜별 엣지 케이스 -->

**Hypothesis**: October 25th might trigger a specific bug (e.g., timezone, DST)

**Test**: Try creating yearly events on:
- Different months
- Different days of month
- Days near month boundaries

---

## 5. Debugging Steps Required
<!-- 필요한 디버깅 단계 -->

### Step 1: Add Logging ⚠️ PRIORITY
<!-- 1단계: 로깅 추가 -->

**Location**: `App.tsx` → `handleDeleteSingle`

```typescript
const handleDeleteSingle = async () => {
  if (!eventToDelete) return;

  console.log('🔍 DELETE SINGLE DEBUG:');
  console.log('Event to delete:', eventToDelete);
  console.log('Event ID:', eventToDelete.id);
  console.log('Event date:', eventToDelete.date);
  console.log('Event repeat:', eventToDelete.repeat);

  await deleteEvent(eventToDelete.id);

  setIsDeleteOptionsDialogOpen(false);
  setEventToDelete(null);
};
```

**Location**: `useEventOperations.ts` → `deleteEvent`

```typescript
const deleteEvent = async (id: string) => {
  try {
    console.log('🔍 DELETE EVENT DEBUG:');
    console.log('Deleting ID:', id);
    console.log('DELETE URL:', `/api/events/${id}`);

    const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

    console.log('Delete response status:', response.status);
    console.log('Delete response ok:', response.ok);

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }

    await fetchEvents();
    enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
  } catch (error) {
    console.error('Error deleting event:', error);
    enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
  }
};
```

### Step 2: Verify Event Generation
<!-- 2단계: 이벤트 생성 확인 -->

**Check**: After creating yearly event on 2025-10-25, verify:

```typescript
// In browser console after creating event:
const yearlyEvents = events.filter(e => e.title === "매년 테스트");
console.log('Generated yearly events:', yearlyEvents);
yearlyEvents.forEach(e => {
  console.log(`Date: ${e.date}, ID: ${e.id}, Repeat ID: ${e.repeat?.id}`);
});
```

**Expected**:
```
Date: 2025-10-25, ID: abc-123, Repeat ID: series-xyz
Date: 2026-10-25, ID: abc-124, Repeat ID: series-xyz
Date: 2027-10-25, ID: abc-125, Repeat ID: series-xyz
...
```

### Step 3: Check Backend Response
<!-- 3단계: 백엔드 응답 확인 -->

**Action**: Open Network tab before delete

**Check**:
1. DELETE request is sent to `/api/events/:id`
2. Request URL contains correct ID
3. Response status is 204 (success)
4. No error response body

### Step 4: Verify Database State
<!-- 4단계: 데이터베이스 상태 확인 -->

**Check**: After delete, fetch events again

```typescript
// In browser console after delete:
await fetch('/api/events')
  .then(r => r.json())
  .then(data => {
    const yearlyEvents = data.events.filter(e => e.title === "매년 테스트");
    console.log('Events in DB after delete:', yearlyEvents);
  });
```

**Expected**: 2026-10-25 instance should be gone

---

## 6. Likely Issues Based on Past Reviews
<!-- 과거 리뷰 기반 가능성 높은 문제 -->

### Issue 1: getYearlyOccurrence Date Calculation
<!-- 문제 1: getYearlyOccurrence 날짜 계산 -->

**File**: `src/utils/recurringEventUtils.ts`

**Potential Bug**: Leap year or DST handling

**Need to Check**:
```typescript
function getYearlyOccurrence(
  startDate: Date,
  iterationCount: number,
  interval: number
): Date {
  // How does this handle Oct 25?
  // Does it correctly increment year?
  // Does it preserve day of month?
}
```

### Issue 2: Event ID Generation
<!-- 문제 2: 이벤트 ID 생성 -->

**Potential Bug**: IDs might not be unique or stable

**Check**:
```typescript
// In generateRecurringEvents:
events.push({
  ...event,
  id: generateEventId(),  // ← Is this unique?
  date: formatDate(currentDate),
  repeat: {
    ...event.repeat,
    id: repeatId,  // ← Same for all instances (correct)
    originalEventId,  // ← Points to template?
    originalDate: event.date,  // ← Original start date
  },
});
```

**Question**: Is `generateEventId()` producing unique IDs for each instance?

### Issue 3: Fetch After Delete
<!-- 문제 3: 삭제 후 다시 가져오기 -->

**Potential Bug**: `fetchEvents()` might be regenerating deleted instance

**Check**: Does `fetchEvents` logic re-create instances from template?

```typescript
// In useEventOperations.ts fetchEvents():
const isTemplateEvent = event.repeat.type !== 'none' && !event.repeat.id;

if (isTemplateEvent) {
  // Old template-style event: expand it
  const occurrences = generateRecurringEvents(event);
  expandedEvents.push(...occurrences);
}
```

**Question**: If 2026-10-25 instance is deleted, could there be a template event that regenerates it?

---

## 7. Recommended Solution Path
<!-- 권장 해결 방법 -->

### Phase 1: Diagnosis (디버깅)
<!-- 1단계: 진단 -->

1. ✅ Add logging to `handleDeleteSingle` and `deleteEvent`
2. ✅ Reproduce bug with logging enabled
3. ✅ Check console for:
   - Event ID being deleted
   - DELETE request URL
   - Response status
4. ✅ Check Network tab for actual HTTP request
5. ✅ Verify DB state after delete

### Phase 2: Root Cause Identification
<!-- 2단계: 근본 원인 파악 -->

Based on Phase 1 findings, identify which cause:
- **A**: Generation issue (wrong date calculated)
- **B**: ID mismatch (wrong ID being used)
- **C**: Backend issue (delete fails)
- **D**: Re-fetch issue (instance regenerated)

### Phase 3: Fix Implementation
<!-- 3단계: 수정 구현 -->

**If Cause A (Generation)**:
- Fix `getYearlyOccurrence` logic
- Add test case for Oct 25 yearly events

**If Cause B (ID Mismatch)**:
- Fix ID generation or usage
- Ensure unique IDs for all instances

**If Cause C (Backend)**:
- Fix backend DELETE endpoint
- Add error handling

**If Cause D (Re-fetch)**:
- Fix `fetchEvents` logic
- Ensure deleted instances don't regenerate

---

## 8. Test Case to Add
<!-- 추가할 테스트 케이스 -->

```typescript
describe('Yearly Recurring Event Deletion', () => {
  it('should delete single instance of yearly event on Oct 25', async () => {
    // Setup: Create yearly event on 2025-10-25
    const yearlyEvent = {
      title: '매년 이벤트',
      date: '2025-10-25',
      repeat: { type: 'yearly', interval: 1 }
    };
    
    await createEvent(yearlyEvent);
    
    // Navigate to 2026-10-25
    navigateToDate('2026-10-25');
    
    // Find 2026 instance
    const instance2026 = screen.getByText(/2026-10-25/);
    
    // Delete single instance
    fireEvent.click(within(instance2026).getByLabelText('Delete event'));
    fireEvent.click(screen.getByText('예')); // Delete single
    
    // Verify: 2026 instance deleted
    await waitFor(() => {
      expect(screen.queryByText(/2026-10-25/)).not.toBeInTheDocument();
    });
    
    // Verify: 2025 and 2027 instances still exist
    navigateToDate('2025-10-25');
    expect(screen.getByText(/2025-10-25/)).toBeInTheDocument();
    
    navigateToDate('2027-10-25');
    expect(screen.getByText(/2027-10-25/)).toBeInTheDocument();
  });
});
```

---

## 9. Next Steps
<!-- 다음 단계 -->

### Immediate Actions (Worker)
<!-- 즉시 조치 (노동자) -->

1. ✅ **Add Debug Logging**: Implement logging in `handleDeleteSingle` and `deleteEvent`
2. ✅ **Reproduce Bug**: Create yearly event on 2025-10-25, try deleting 2026-10-25
3. ✅ **Collect Debug Output**: Share console logs and network requests
4. ✅ **Report Findings**: Update this review with diagnosis results

### Investigation Focus
<!-- 조사 초점 -->

**Priority Questions**:
1. Is 2026-10-25 instance actually created in DB?
2. What is the ID of 2026-10-25 instance?
3. Does DELETE request get sent with correct ID?
4. What is the response status?
5. Is the instance deleted from DB but regenerated by frontend?

---

## 10. Preliminary Assessment
<!-- 예비 평가 -->

**Likelihood of Each Cause**:
- **Cause A (Generation)**: 30% - Unlikely, yearly generation is simple
- **Cause B (ID Mismatch)**: 20% - Possible but should throw errors
- **Cause C (Backend)**: 10% - DELETE endpoint is simple
- **Cause D (Re-fetch)**: 40% - **MOST LIKELY** - Template regeneration issue

**Why Cause D is Most Likely**:
<!-- 왜 원인 D가 가장 가능성 높은가: -->
```typescript
// If an old template-style event exists without repeat.id:
const isTemplateEvent = event.repeat.type !== 'none' && !event.repeat.id;

if (isTemplateEvent) {
  // This will ALWAYS regenerate instances
  const occurrences = generateRecurringEvents(event);
  expandedEvents.push(...occurrences);
}
```

**Hypothesis**: User might have an old yearly event created before the instance model was implemented. This template event regenerates instances every time `fetchEvents()` is called, including after delete.

**Test**: Check if event has `repeat.id`:
```typescript
console.log('Event repeat.id:', eventToDelete.repeat?.id);
// If undefined → Template model (will regenerate)
// If defined → Instance model (should delete properly)
```

---

## Final Verdict
<!-- 최종 판정 -->

✅ **ROOT CAUSE IDENTIFIED & FIXED**

**Actual Cause**: Default endDate limitation (Not Cause A, B, C, or D)

**Root Cause**:
```typescript
// App.tsx - Before fix
endDate: repeatEndDate || '2025-12-31',  // ❌ Default limits to 2025

// Timeline:
// 2025-10-25: Create yearly event
// endDate: undefined → defaults to '2025-12-31'
// generateRecurringEvents creates:
//   ✅ 2025-10-25 (before endDate)
//   ❌ 2026-10-25 (after endDate - NOT CREATED)
```

**Why Delete Appeared to Fail**:
- 2026-10-25 instance was **never created** due to endDate constraint
- User couldn't delete what didn't exist

**Solution Implemented**: Option C - Make endDate required

### Changes Made

#### 1. App.tsx - Add Validation
```typescript
// Validate repeat end date is required for repeating events
if (isRepeating && !repeatEndDate) {
  enqueueSnackbar('반복 일정의 종료 날짜를 선택해주세요.', { variant: 'error' });
  return;
}
```

#### 2. App.tsx - Remove Default endDate
```typescript
// Before
endDate: repeatEndDate || '2025-12-31',

// After
endDate: repeatEndDate,  // No default - user must provide
```

#### 3. App.tsx - UI Updates
```typescript
<FormLabel htmlFor="repeat-end-date" required>
  반복 종료 날짜
</FormLabel>
<TextField
  id="repeat-end-date"
  required
  helperText="반복 일정의 종료 날짜를 선택해주세요 (필수)"
/>
```

### Benefits of This Solution

**Advantages**:
1. ✅ **User Awareness**: Forces users to think about when recurring events should end
2. ✅ **Prevents Confusion**: No silent date limiting (like old 2025-12-31 default)
3. ✅ **Data Integrity**: All recurring events have explicit end dates
4. ✅ **UI Clarity**: Required field clearly marked with * and helper text

**User Experience**:
```
Before Fix:
1. Create yearly event on 2025-10-25
2. Skip end date field → silently defaults to 2025-12-31
3. Navigate to 2026-10-25 → event not there
4. Confusion: "Where's my event?"

After Fix:
1. Create yearly event on 2025-10-25
2. Skip end date field → Clear error: "반복 일정의 종료 날짜를 선택해주세요"
3. User selects 2030-12-31
4. Events created through 2030 ✅
```

### Testing Verification

**Test Case**:
```typescript
describe('Yearly Recurring Event with Required End Date', () => {
  it('should prevent creation without end date', async () => {
    // Fill form
    fillEventForm({
      title: '매년 이벤트',
      date: '2025-10-25',
      isRepeating: true,
      repeatType: 'yearly'
      // endDate: NOT PROVIDED
    });
    
    // Try to save
    fireEvent.click(screen.getByText('일정 추가'));
    
    // Verify error
    await waitFor(() => {
      expect(screen.getByText('반복 일정의 종료 날짜를 선택해주세요.')).toBeInTheDocument();
    });
  });
  
  it('should create instances through end date', async () => {
    // Fill form with end date
    fillEventForm({
      title: '매년 이벤트',
      date: '2025-10-25',
      isRepeating: true,
      repeatType: 'yearly',
      endDate: '2030-12-31'  // ✅ PROVIDED
    });
    
    // Save
    fireEvent.click(screen.getByText('일정 추가'));
    
    // Verify instances created
    const events = await fetchEvents();
    const yearlyEvents = events.filter(e => e.title === '매년 이벤트');
    
    expect(yearlyEvents).toHaveLength(6);  // 2025, 2026, 2027, 2028, 2029, 2030
    expect(yearlyEvents.map(e => e.date)).toEqual([
      '2025-10-25',
      '2026-10-25',
      '2027-10-25',
      '2028-10-25',
      '2029-10-25',
      '2030-10-25'
    ]);
  });
});
```

---

## Implementation History
<!-- 구현 이력 -->

### Attempt 1: Initial Investigation
- **Status**: ❌ Wrong hypothesis
- **Approach**: Suspected generation bug, ID mismatch, backend issue, or re-fetch issue
- **Outcome**: Added debug logging

### Attempt 2: User Insight
- **Status**: ✅ Correct diagnosis
- **User Question**: "혹시 내가 마감일정을 선택 안하면 최대가 2025-12-31로 지정해서 그런건지 확인해봐."
- **Finding**: Default `endDate: '2025-12-31'` was limiting recurring instances

### Attempt 3: Solution Implementation
- **Status**: ✅ Success
- **Changes**: 
  - Made endDate required for recurring events
  - Added validation with clear error message
  - Updated UI with required indicator
  - Removed default endDate value

**Key Learnings**:
1. Sometimes the user knows the system better than we think
2. Silent defaults can cause confusing behavior
3. Explicit validation > implicit defaults
4. Good error messages prevent user confusion

---

**Created by**: Feedback (관리자)
**Implemented by**: Worker (노동자)
**Reviewed by**: King (건물주)
**Priority**: HIGH → ✅ RESOLVED
**Time to Resolution**: 20 minutes

