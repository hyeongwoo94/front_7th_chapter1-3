# Code Review Report

**Date**: 2025-10-29
**Reviewer**: Manager (관리자)
**Reviewed By**: Worker (노동자)
**Task**: Recurring Event Edit/Delete Implementation Issues
**PRD**: `request/recurring-event-edit-single-or-all.md`, `request/recurring-event-delete-single-or-all.md`, `request/recurring-event-end-date.md`

---

## Review Summary

After implementing the recurring event edit, delete, and end date features, user testing revealed **three critical issues** that need immediate attention:

1. **Issue 1**: "Edit Single" behavior is incorrect - it converts recurring event to single event instead of just editing that instance
2. **Issue 2**: End date modification doesn't work - shows notification deletion alert instead
3. **Issue 3**: Default end date logic is wrong - should default to year-end (2025-12-31) instead of infinite

---

## Issue 1: Single Edit Converts to Normal Event ❌

### Problem Description
<!-- 문제 설명 -->

**Steps to Reproduce**:
1. Create a daily recurring event
2. Click edit button on one instance
3. Modify the content (e.g., change title)
4. Click "일정 수정" button
5. Click "예" in the "반복 일정 수정" dialog

**Expected Behavior**:
- The specific instance should be modified
- The event should remain a recurring event
- Other instances should not be affected

**Actual Behavior**:
- The content is modified ✅
- **The recurring event is deleted** ❌
- **It's converted to a single (non-recurring) event** ❌

### Root Cause Analysis
<!-- 근본 원인 분석 -->

Looking at `src/App.tsx` `handleEditSingle` function:

```typescript:245:286:src/App.tsx
const handleEditSingle = async () => {
  if (!pendingEventData) return;

  const originalEvent = pendingEventData as Event;

  // Remove ID and repeat metadata to create NEW event
  // <!-- ID와 반복 메타데이터 제거하여 새 이벤트 생성 -->
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, repeat, ...eventWithoutIdAndRepeat } = originalEvent;

  const singleEventData: EventForm = {
    ...eventWithoutIdAndRepeat,
    repeat: {
      type: 'none',  // ❌ PROBLEM: Forcing repeat.type to 'none'
      interval: 0,
    },
  };

  setIsEditOptionsDialogOpen(false);
  setPendingEventData(null);

  try {
    // For instance model: delete original instance first
    await deleteEvent(originalEvent.id);

    // After deletion, check for overlaps with the NEW event data
    const remainingEvents = events.filter((e) => e.id !== originalEvent.id);
    const overlapping = findOverlappingEvents(singleEventData, remainingEvents);

    if (overlapping.length > 0) {
      const canBypass = shouldAllowOverlapBypass(singleEventData, overlapping);
      if (!canBypass) {
        setOverlappingEvents(overlapping);
        setAllowBypass(false);
        setIsOverlapDialogOpen(true);
        return;
      }
    }

    // Directly POST new single event (bypass editingEvent state issue)
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(singleEventData),  // ❌ Posting as single event
    });
    // ...
  }
};
```

**The Problem**:
- The function is **hardcoded to convert to single event** (`repeat.type: 'none'`)
- This was the **original design intent** from the previous PRD
- But the **user requirement was misunderstood**

**Original (Incorrect) Understanding**:
- "Edit Single" = Convert that instance to a single, independent event

**Correct User Requirement**:
- "Edit Single" = Edit that instance only, but keep it as part of the recurring series (with exceptions)

### Solution
<!-- 해결 방안 -->

**Option A: Exception-based Model** (Recommended)
- Keep the original recurring event
- Add this specific instance to an `exceptions` array
- Create a new "override" event for this specific date
- When rendering, skip the exception date and show the override instead

**Option B: Hybrid Model**
- For single edits, create a separate event with a reference to the original series
- Mark it as `isException: true` with `originalSeriesId`

**Implementation Strategy**:
1. Add `exceptions?: string[]` to `RepeatInfo` type ✅ (already exists in types.ts)
2. Modify `handleEditSingle` to:
   - Update the original recurring event to add this date to exceptions
   - Create a new event for this specific date (with original repeat metadata for reference)
3. Modify `generateRecurringEvents` to skip exception dates
4. Modify rendering logic to show exception events

---

## Issue 2: End Date Modification Doesn't Work ❌

### Problem Description
<!-- 문제 설명 -->

**Steps to Reproduce**:
1. Select a recurring event instance
2. Try to modify the "반복 종료 날짜" field
3. Save the changes

**Expected Behavior**:
- The end date should be updated for all instances in the series
- Events after the new end date should be removed from the calendar

**Actual Behavior**:
- The modification doesn't work
- Shows "알림 삭제 등록 알림" (notification deletion registration alert) instead

### Root Cause Analysis
<!-- 근본 원인 분석 -->

Need to investigate:
1. Is `repeatEndDate` state being updated correctly in the form?
2. Is the "Edit All" flow including `repeatEndDate` in the update payload?
3. Is the backend/mock handler processing `endDate` updates?

The error message about "알림 삭제" suggests there might be a **UI field confusion** or **event handler mismatch**.

### Solution
<!-- 해결 방안 -->

**Investigation Steps**:
1. Check if `repeatEndDate` is properly destructured in `handleEditAll`
2. Verify that `updateData` in `handleEditAll` includes `repeat.endDate`
3. Check if the mock handler for `PUT /api/recurring-events/:repeatId` preserves `repeat.endDate`

**Expected Fix**:
```typescript
const handleEditAll = async () => {
  // ...
  const { id: _id, repeat: _repeat, ...updateData } = pendingEventData as Event;
  
  // ❌ Current: updateData doesn't include repeat.endDate
  // ✅ Fixed: Include repeat metadata with updated endDate
  const updatePayload = {
    ...updateData,
    repeat: {
      ...pendingEventData.repeat,
      endDate: repeatEndDate || undefined,  // Include the new endDate
    },
  };
  
  const response = await fetch(`/api/recurring-events/${repeatId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatePayload),
  });
  // ...
};
```

---

## Issue 3: Default End Date Should Be Year-End ❌

### Problem Description
<!-- 문제 설명 -->

**Current Behavior**:
- When creating a recurring event, if `repeatEndDate` is left empty, it creates "infinite" repeating events
- Helper text says: "(선택사항: 비워두면 무한 반복)"

**Required Behavior**:
- If `repeatEndDate` is empty, it should default to the **end of the current year** (2025-12-31)
- Helper text should say: "(선택사항: 2025-12-31)"

### Root Cause Analysis
<!-- 근본 원인 분석 -->

Looking at `src/utils/recurringEventUtils.ts`:

```typescript:62:64:src/utils/recurringEventUtils.ts
if (event.repeat.endDate && currentDate > new Date(event.repeat.endDate)) {
  break;
}
```

The logic checks `event.repeat.endDate`, but if it's `undefined`, the loop continues indefinitely (up to the hardcoded limit).

**Current Flow**:
1. User creates recurring event without specifying end date
2. `repeatEndDate` is `undefined` or empty string
3. `generateRecurringEvents` keeps generating until it hits the hardcoded limit
4. Result: Many events (effectively "infinite" within the range)

### Solution
<!-- 해결 방안 -->

**Fix 1: Default to Year-End in Form Submission**

In `App.tsx` `addOrUpdateEvent` function:

```typescript
const addOrUpdateEvent = async () => {
  // ...
  if (isRepeating) {
    // ✅ If repeatEndDate is empty, default to end of current year
    const defaultEndDate = repeatEndDate || '2025-12-31';
    
    eventData.repeat = {
      type: repeatType,
      interval: repeatInterval,
      endDate: defaultEndDate,  // Always set endDate
    };
  }
  // ...
};
```

**Fix 2: Update Helper Text**

In `App.tsx` TextField for repeatEndDate:

```typescript
<TextField
  label="반복 종료 날짜"
  type="date"
  value={repeatEndDate}
  onChange={(e) => setRepeatEndDate(e.target.value)}
  fullWidth
  InputLabelProps={{ shrink: true }}
  helperText="(선택사항: 2025-12-31)"  // ✅ Updated text
/>
```

---

## Action Items

### Priority 1: Fix Single Edit Behavior (Critical)

**Task**: Implement exception-based model for single instance editing
**Files to Modify**:
- `src/App.tsx` - `handleEditSingle` function
- `src/hooks/useEventOperations.ts` - `saveEvent` and `fetchEvents`
- `src/utils/recurringEventUtils.ts` - `generateRecurringEvents`
- `src/__tests__/medium.integration.spec.tsx` - Update test expectations

**Implementation Steps**:
1. Modify `handleEditSingle` to:
   ```typescript
   const handleEditSingle = async () => {
     const originalEvent = pendingEventData as Event;
     const originalRepeatId = originalEvent.repeat?.id;
     
     if (!originalRepeatId) {
       // Not part of a recurring series, edit normally
       await saveEvent(pendingEventData);
       return;
     }
     
     // Step 1: Add this date to exceptions in the original series
     const response = await fetch(`/api/recurring-events/${originalRepeatId}/add-exception`, {
       method: 'POST',
       body: JSON.stringify({ exceptionDate: originalEvent.date }),
     });
     
     // Step 2: Create a new event for this specific date (marked as exception)
     const exceptionEvent = {
       ...pendingEventData,
       id: undefined,  // New ID will be assigned
       repeat: {
         type: 'none',
         interval: 0,
         isException: true,  // Mark as exception
         originalSeriesId: originalRepeatId,
       },
     };
     
     await saveEvent(exceptionEvent);
     // ...
   };
   ```

2. Update `generateRecurringEvents` to skip exception dates:
   ```typescript
   export function generateRecurringEvents(event: Event): Event[] {
     const exceptions = event.repeat.exceptions || [];
     // ... when generating instances ...
     if (exceptions.includes(currentDateStr)) {
       continue;  // Skip this date
     }
     // ...
   }
   ```

3. Update tests to verify:
   - Original recurring event still exists
   - Exception event is created for the specific date
   - Other instances are not affected

### Priority 2: Fix End Date Modification (High)

**Task**: Ensure end date can be modified when editing recurring series
**Files to Modify**:
- `src/App.tsx` - `handleEditAll` function
- `src/__mocks__/handlers.ts` - Verify PUT handler includes repeat metadata

**Implementation**:
```typescript
const handleEditAll = async () => {
  // ... existing code ...
  
  // Include repeat metadata with updated endDate
  const updatePayload = {
    ...updateData,
    repeat: {
      type: editingEvent.repeat.type,
      interval: editingEvent.repeat.interval,
      id: editingEvent.repeat.id,
      endDate: repeatEndDate || undefined,
    },
  };
  
  const response = await fetch(`/api/recurring-events/${repeatId}`, {
    method: 'PUT',
    body: JSON.stringify(updatePayload),
  });
  // ...
};
```

### Priority 3: Default End Date to Year-End (Medium)

**Task**: Set default end date to 2025-12-31 if not specified
**Files to Modify**:
- `src/App.tsx` - `addOrUpdateEvent` function, helper text

**Implementation**:
```typescript
// In addOrUpdateEvent
if (isRepeating) {
  const defaultEndDate = repeatEndDate || '2025-12-31';
  eventData.repeat = {
    type: repeatType,
    interval: repeatInterval,
    endDate: defaultEndDate,
  };
}

// Update helper text
<TextField
  label="반복 종료 날짜"
  type="date"
  value={repeatEndDate}
  onChange={(e) => setRepeatEndDate(e.target.value)}
  fullWidth
  InputLabelProps={{ shrink: true }}
  helperText="(선택사항: 2025-12-31)"
/>
```

---

## Testing Checklist

After fixes, verify:

- [ ] **Single Edit**:
  - [ ] Editing one instance keeps it as part of recurring series
  - [ ] Other instances are not affected
  - [ ] Repeat icon still shows on edited instance
  - [ ] Exception logic works correctly

- [ ] **End Date Modification**:
  - [ ] Can modify end date when editing recurring series
  - [ ] Events after new end date are removed
  - [ ] No notification deletion alerts appear

- [ ] **Default End Date**:
  - [ ] Empty end date defaults to 2025-12-31
  - [ ] Helper text shows correct message
  - [ ] Year-end events are generated correctly

- [ ] **All Tests Pass**:
  - [ ] Unit tests for recurringEventUtils
  - [ ] Integration tests for edit flow
  - [ ] No TypeScript errors
  - [ ] ESLint passes

---

## Final Verdict

⚠️ **NEEDS REVISION**

**Reason**: Three critical bugs discovered during user testing that prevent core functionality from working as intended.

**Estimated Fix Time**: 2-3 hours
**Risk Level**: Medium (requires careful handling of exception logic)
**Priority**: High (affects user experience significantly)

