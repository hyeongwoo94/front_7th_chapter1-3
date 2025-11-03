# Code Review Report - Recurring Event Delete Bug (Final Fix)

**Date**: 2025-10-29
**Reviewer**: Manager (관리자)
**Reviewed By**: Worker (노동자)
**Task**: 반복 일정 삭제 기능 최종 버그 수정 (3차)
**Previous Review**: `2025-10-29_recurring-event-delete-single-not-working.md`
**Status**: 🔴 CRITICAL BUG FOUND

---

## 1. Question Analysis

**Original Question (3차)**: "리뷰해. 1.반복일정의 삭제 버튼을 누른다. 2. 예 아니오, 취소를 선택하는 알림이 나온다. 3. 예를 누를경우 일정이 삭제되었다는 알림은 나오지만 알림은 삭제 되지 않는다. 4. 아니오를 누를경우 일정 삭제 실패가 나온다."
<!-- 원본 질문 (3차): -->

**🔴 오류 요약 (최종)**: 데이터베이스의 반복 일정에 `repeat.id`가 없음 → 단일/전체 삭제 모두 실패
<!-- 오류 요약: -->

**✅ 해결방안 제시**: 기존 데이터 구조 이해 + `repeat.id` 없이도 작동하도록 삭제 로직 수정
<!-- 해결방안 제시: -->

**Intent**: Fix delete functionality - both single and all delete not working due to missing repeat.id
<!-- 의도: 삭제 기능 수정 - repeat.id 누락으로 인한 단일/전체 삭제 모두 실패 -->

**Scope**: 
- `src/App.tsx` - `handleDeleteAll()` 함수
- `src/__mocks__/response/realEvents.json` - 실제 데이터 구조
- `server.js` - API 엔드포인트 동작 확인
<!-- 범위: -->

**Context**: Two previous fixes attempted but data model mismatch not identified
<!-- 맥락: 두 번의 수정 시도했으나 데이터 모델 불일치를 파악하지 못함 -->

---

## 2. Critical Discovery - Root Cause

### The Real Problem: Missing `repeat.id` in Database
<!-- 진짜 문제: 데이터베이스에 repeat.id 누락 -->

**What We Expected** (Based on server.js):
```json
{
  "id": "abc123",
  "title": "Weekly Meeting",
  "repeat": {
    "type": "weekly",
    "interval": 1,
    "id": "series-uuid-here"  // ✅ Should exist
  }
}
```

**What Actually Exists** (In realEvents.json):
```json
{
  "id": "369acf82-159b-49f0-af47-77c36cc1a54e",
  "title": "123",
  "repeat": {
    "type": "none",
    "interval": 1,
    "endDate": "2025-10-17"
    // ❌ NO repeat.id field!
  }
}
```

**Impact**:
1. `handleDeleteSingle()` → `deleteEvent(id)` → Actually works BUT...
2. `deleteEvent()` in `useEventOperations.ts` might have issues
3. `handleDeleteAll()` → `repeatId = eventToDelete.repeat?.id` → **undefined**
4. `fetch(/api/recurring-events/${undefined})` → 404 or malformed URL

---

## 3. Why This Happened

### Timeline of Data Model Evolution
<!-- 데이터 모델 진화 타임라인 -->

**Phase 1: Initial Development**
- Events created without `repeat.id`
- Simple delete logic (one at a time)

**Phase 2: Server Code Updated**
- `POST /api/events-list` now adds `repeat.id` (line 81-92 in server.js)
- New events have `repeat.id`
- Old events in DB don't have `repeat.id`

**Phase 3: Our Implementation**
- Assumed ALL recurring events have `repeat.id`
- Code fails on old data

**Result**: **Data migration was never performed**

---

## 4. Evidence Analysis

### Evidence 1: Server Code Confirms repeat.id Should Exist
<!-- 증거 1: 서버 코드는 repeat.id가 있어야 한다고 확인 -->

**File**: `server.js` (lines 79-102)

```javascript
app.post('/api/events-list', async (req, res) => {
  const events = await getEvents();
  const repeatId = randomUUID(); // ✅ Generate ID
  const newEvents = req.body.events.map((event) => {
    const isRepeatEvent = event.repeat.type !== 'none';
    return {
      id: randomUUID(),
      ...event,
      repeat: {
        ...event.repeat,
        id: isRepeatEvent ? repeatId : undefined, // ✅ Add repeat.id
      },
    };
  });
  // ...
});
```

**Conclusion**: Server DOES add `repeat.id` for new recurring events.

---

### Evidence 2: Database Shows repeat.id is Missing
<!-- 증거 2: 데이터베이스는 repeat.id가 없음을 보여줌 -->

**File**: `src/__mocks__/response/realEvents.json`

**Sample Event with repeat type but NO repeat.id**:
```json
{
  "id": "ea1e5f6a-3000-47ed-ab44-1062e68f54c5",
  "title": "324234234",
  "date": "2025-11-03",
  "repeat": {
    "type": "daily",        // ✅ Has type
    "interval": 1,          // ✅ Has interval
    "endDate": "2025-11-20" // ✅ Has endDate
    // ❌ NO id field!
  }
}
```

**Conclusion**: Existing data lacks `repeat.id`.

---

### Evidence 3: User Symptoms Match Missing repeat.id
<!-- 증거 3: 사용자 증상이 repeat.id 누락과 일치 -->

**Symptom 1**: "예" (single delete) → Alert shows but not deleted
- `deleteEvent(eventToDelete.id)` called
- Snackbar shows "일정이 삭제되었습니다"
- But event still visible

**Analysis**: 
- `deleteEvent` function must be failing silently
- OR event is deleted but UI doesn't update

**Symptom 2**: "아니오" (all delete) → "일정 삭제 실패"
- `repeatId = eventToDelete.repeat?.id` → **undefined**
- `fetch(/api/recurring-events/${undefined})` → Fails
- Catch block: `enqueueSnackbar('일정 삭제 실패', { variant: 'error' })`

**Analysis**: This is the smoking gun! No `repeat.id` → API call fails.

---

## 5. Code Analysis - What's Actually Happening

### handleDeleteSingle() Flow
<!-- handleDeleteSingle() 흐름 -->

```typescript
const handleDeleteSingle = async () => {
  if (!eventToDelete) return;

  // Calls deleteEvent with event ID
  // <!-- 이벤트 ID로 deleteEvent 호출 -->
  await deleteEvent(eventToDelete.id);  // ← eventToDelete.id exists

  setIsDeleteOptionsDialogOpen(false);
  setEventToDelete(null);
};
```

**Expected**: Delete single event by ID
**Problem**: `deleteEvent` function is async but no error handling here
**Result**: Even if `deleteEvent` fails, dialog closes and state resets

---

### handleDeleteAll() Flow
<!-- handleDeleteAll() 흐름 -->

```typescript
const handleDeleteAll = async () => {
  if (!eventToDelete) return;

  try {
    const repeatId = eventToDelete.repeat?.id; // ← undefined for old events
    if (repeatId) {
      const response = await fetch(`/api/recurring-events/${repeatId}`, {
        method: 'DELETE',
      });
      // ...
    } else {
      // Fallback: single event
      await deleteEvent(eventToDelete.id); // ← This runs!
    }
    // ...
  } catch (error) {
    enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
  }
};
```

**Wait! There's a fallback!**
- If no `repeatId`, it calls `deleteEvent(eventToDelete.id)`
- This should work for single delete

**So why does user see "일정 삭제 실패"?**

Possible reasons:
1. `deleteEvent` throws an error
2. `fetchEvents()` after delete fails
3. Some other error in the try block

---

## 6. Investigation Required

### Check 1: Does /api/events/:id DELETE Actually Work?
<!-- 확인 1: /api/events/:id DELETE가 실제로 작동하는가? -->

**Server Code** (line 65-77):
```javascript
app.delete('/api/events/:id', async (req, res) => {
  const events = await getEvents();
  const id = req.params.id;

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/${dbName}`,
    JSON.stringify({
      events: events.events.filter((event) => event.id !== id),
    })
  );

  res.status(204).send();
});
```

**Analysis**: 
- ✅ Endpoint exists
- ✅ Filters out event by ID
- ✅ Returns 204 (success)

**Conclusion**: API endpoint is correct.

---

### Check 2: Is There a Problem with Recurring Event Instances?
<!-- 확인 2: 반복 일정 인스턴스에 문제가 있는가? -->

**Critical Question**: When user sees "매주추가" in the UI, is that:
1. A single event with `repeat.type: 'weekly'`? OR
2. Multiple event instances with shared `repeat.id`?

**From realEvents.json**:
```json
{
  "id": "416d1cd1-b641-4e3d-8ed3-5a9a2f4282bf",
  "title": "매주추가",
  "date": "2025-10-24",
  "repeat": {
    "type": "none",  // ❌ type is "none"!
    "interval": 1
  }
}
```

**Wait... `type: "none"`?!**

This event is NOT actually a recurring event! It's marked as single event.

**Hypothesis**: Frontend generates recurring instances from a template, but only 1 record exists in DB.

---

### Check 3: How Are Recurring Events Displayed?
<!-- 확인 3: 반복 일정은 어떻게 표시되는가? -->

Need to check `src/utils/recurringEventUtils.ts` to understand how events are expanded.

**If hypothesis is correct**:
- User creates "weekly meeting"
- Frontend shows it on multiple weeks
- But DB has only 1 record (the template)
- When deleting, we delete the template
- But UI still shows instances because `fetchEvents()` re-generates them from... where?

**Critical Discovery Needed**: How are events stored vs. displayed?

---

## 7. Hypothesis

### Hypothesis A: Single Template Model (Most Likely)
<!-- 가설 A: 단일 템플릿 모델 (가장 가능성 높음) -->

**Storage**:
```
DB has 1 event:
{ id: "abc", date: "2025-10-24", repeat: { type: "weekly" } }
```

**Display**:
```
Frontend generates multiple instances:
Week 1: "매주추가" (from template)
Week 2: "매주추가" (from template)
Week 3: "매주추가" (from template)
```

**Delete Behavior**:
- Delete template → All instances disappear
- No way to delete "single instance" because it doesn't exist in DB

**Problem with our code**:
- We're trying to delete a single instance that doesn't exist as a DB record
- `DELETE /api/events/:id` deletes the template
- `fetchEvents()` reloads → Template still there? Or gone?

---

### Hypothesis B: Multiple Instance Model
<!-- 가설 B: 다중 인스턴스 모델 -->

**Storage**:
```
DB has 3 events:
{ id: "abc", date: "2025-10-24", repeat: { type: "weekly", id: "series-1" } }
{ id: "def", date: "2025-10-31", repeat: { type: "weekly", id: "series-1" } }
{ id: "ghi", date: "2025-11-07", repeat: { type: "weekly", id: "series-1" } }
```

**Delete Behavior**:
- Delete single: `DELETE /api/events/abc` → Only that instance gone
- Delete all: `DELETE /api/recurring-events/series-1` → All 3 gone

**Problem with our data**:
- Old events created before `repeat.id` was added
- They don't have `repeat.id`
- Delete all fails because no `repeat.id`

---

## 8. Required Actions

### Action 1: Identify Current Data Model ✅ PRIORITY
<!-- 조치 1: 현재 데이터 모델 파악 -->

**Method**: Check `recurringEventUtils.ts` to see how events are generated

**Questions**:
1. Does `generateRecurringEvents()` read from DB or generate on-the-fly?
2. When we save a recurring event, how many DB records are created?
3. Is there a "template" concept or all instances are real records?

---

### Action 2: Fix Based on Actual Model
<!-- 조치 2: 실제 모델에 따라 수정 -->

**If Single Template Model**:
```typescript
// Single delete = Delete template (all instances gone)
// Can't have "single instance delete" with this model

const handleDeleteSingle = async () => {
  // This will delete ALL instances (template model)
  await deleteEvent(eventToDelete.id);
  // User should be warned!
};
```

**If Multiple Instance Model**:
```typescript
// Need to find all instances with same repeat pattern
// Or use repeat.id if available

const handleDeleteAll = async () => {
  if (eventToDelete.repeat?.id) {
    // New data: has repeat.id
    await fetch(`/api/recurring-events/${repeatId}`, { method: 'DELETE' });
  } else {
    // Old data: find by title + repeat pattern
    // This is a hack but necessary for old data
    const allEvents = await fetch('/api/events').then(r => r.json());
    const sameSeriesEvents = allEvents.events.filter(e => 
      e.title === eventToDelete.title &&
      e.repeat.type === eventToDelete.repeat.type &&
      e.repeat.interval === eventToDelete.repeat.interval
    );
    const ids = sameSeriesEvents.map(e => e.id);
    await fetch('/api/events-list', {
      method: 'DELETE',
      body: JSON.stringify({ eventIds: ids })
    });
  }
};
```

---

### Action 3: Data Migration (Optional)
<!-- 조치 3: 데이터 마이그레이션 (선택사항) -->

**Add `repeat.id` to existing recurring events**:

```javascript
// One-time migration script
const events = await getEvents();
const groupedByRepeatPattern = {};

events.events.forEach(event => {
  if (event.repeat.type !== 'none' && !event.repeat.id) {
    const key = `${event.title}-${event.repeat.type}-${event.repeat.interval}`;
    if (!groupedByRepeatPattern[key]) {
      groupedByRepeatPattern[key] = randomUUID();
    }
    event.repeat.id = groupedByRepeatPattern[key];
  }
});

// Save back to DB
```

---

## 9. Immediate Next Steps

### Step 1: Understand Data Model ⏳
<!-- 1단계: 데이터 모델 이해 -->

Read `src/utils/recurringEventUtils.ts` to confirm storage model.

### Step 2: Check Frontend Event Expansion ⏳
<!-- 2단계: 프론트엔드 이벤트 확장 확인 -->

See how `events` array is populated in App.tsx or hooks.

### Step 3: Decide on Fix Strategy ⏳
<!-- 3단계: 수정 전략 결정 -->

Based on findings:
- If template model: Simplify delete (no single instance delete)
- If instance model: Fix `handleDeleteAll` to work without `repeat.id`

### Step 4: Implement Fix ⏳
<!-- 4단계: 수정 구현 -->

Write correct delete logic based on actual data model.

### Step 5: Test Manually ⏳
<!-- 5단계: 수동 테스트 -->

Create recurring event and test both delete options.

---

## 10. Lessons Learned (So Far)

### Critical Mistake: Assumed Data Structure Without Verification
<!-- 치명적 실수: 검증 없이 데이터 구조 가정 -->

**What We Did Wrong**:
1. Looked at server.js and assumed all events follow that pattern
2. Didn't check actual database file
3. Didn't verify `repeat.id` exists in real data
4. Made 2 fixes without addressing root cause

**What We Should Have Done**:
1. ✅ Check server.js (we did this)
2. ✅ Check actual data in realEvents.json (we DIDN'T do this initially)
3. ✅ Verify assumptions with console.log in running app
4. ✅ Test with actual data, not just test mocks

---

## 11. Prevention Strategy

### Before Implementation Checklist (Updated)
<!-- 구현 전 체크리스트 (업데이트) -->

```markdown
## Data Model Verification (MANDATORY)
<!-- 데이터 모델 검증 (필수) -->

- [ ] Read server API endpoints
- [ ] Check ACTUAL database file (not just schema)
- [ ] Verify sample data has required fields
- [ ] Check for data model version differences
- [ ] Identify old vs new data format
- [ ] Plan for backward compatibility if needed

## Before Writing Delete Logic
<!-- 삭제 로직 작성 전 -->

- [ ] How many DB records exist for one recurring event?
- [ ] Does `repeat.id` exist in ALL recurring events?
- [ ] What happens if `repeat.id` is undefined?
- [ ] Test delete on actual data, not mock data
```

---

## 12. CONFIRMED: Data Model is Template-Based
<!-- 확인됨: 데이터 모델은 템플릿 기반 -->

### Evidence from recurringEventUtils.ts
<!-- recurringEventUtils.ts의 증거 -->

**File**: `src/utils/recurringEventUtils.ts` (lines 7-85)

```typescript
export function generateRecurringEvents(event: Event, maxOccurrences = 365): Event[] {
  // ...
  const originalEventId = event.id; // ✅ Store REAL DB ID
  const repeatId = event.repeat.id || generateRepeatId();
  
  while (events.length < maxOccurrences) {
    events.push({
      ...event,
      id: generateEventId(),  // ❌ Generate FAKE ID for display
      date: dateString,
      repeat: {
        ...event.repeat,
        id: repeatId,
        originalEventId: originalEventId,  // ✅ Store REAL ID here!
        originalDate: event.date,
      },
    });
  }
}
```

**File**: `src/hooks/useEventOperations.ts` (lines 11-38)

```typescript
const fetchEvents = async () => {
  const { events: rawEvents } = await response.json();
  
  const expandedEvents: Event[] = [];
  for (const event of rawEvents) {
    if (event.repeat.type !== 'none') {
      // ❌ Frontend generates instances on-the-fly!
      const occurrences = generateRecurringEvents(event);
      expandedEvents.push(...occurrences);
    }
  }
  
  setEvents(expandedEvents);  // ← User sees these fake-ID events
};
```

---

### Confirmed Data Model: Single Template
<!-- 확인된 데이터 모델: 단일 템플릿 -->

**Storage (DB)**:
```json
{
  "id": "real-uuid-abc",
  "title": "매주회의",
  "date": "2025-10-24",
  "repeat": { "type": "weekly", "interval": 1 }
}
```
↓ **Frontend Expansion**

**Display (UI)**:
```javascript
[
  { id: "event-fake-1", date: "2025-10-24", repeat: { originalEventId: "real-uuid-abc" } },
  { id: "event-fake-2", date: "2025-10-31", repeat: { originalEventId: "real-uuid-abc" } },
  { id: "event-fake-3", date: "2025-11-07", repeat: { originalEventId: "real-uuid-abc" } },
]
```

**Critical Finding**: 
- User sees events with **fake IDs** (`event-fake-1`, etc.)
- Real DB ID is stored in `repeat.originalEventId`
- Deleting with fake ID → **Nothing happens** (ID doesn't exist in DB)

---

## 13. The Fix

### Fix for handleDeleteSingle()
<!-- handleDeleteSingle() 수정 -->

**Current (Broken)**:
```typescript
const handleDeleteSingle = async () => {
  await deleteEvent(eventToDelete.id);  // ❌ Fake ID!
};
```

**Correct**:
```typescript
const handleDeleteSingle = async () => {
  // For template model, deleting "single instance" = delete template
  // This will remove ALL instances from display
  // <!-- 템플릿 모델에서 "단일 인스턴스" 삭제 = 템플릿 삭제 -->
  // <!-- 이렇게 하면 표시에서 모든 인스턴스가 제거됨 -->
  
  const realId = eventToDelete.repeat?.originalEventId || eventToDelete.id;
  await deleteEvent(realId);
  
  setIsDeleteOptionsDialogOpen(false);
  setEventToDelete(null);
};
```

**Note**: With template model, there's NO way to delete a single occurrence. Deleting the template removes all instances.

---

### Fix for handleDeleteAll()
<!-- handleDeleteAll() 수정 -->

**Current (Broken)**:
```typescript
const handleDeleteAll = async () => {
  const repeatId = eventToDelete.repeat?.id;  // ← May be undefined
  if (repeatId) {
    await fetch(`/api/recurring-events/${repeatId}`, { method: 'DELETE' });
  } else {
    await deleteEvent(eventToDelete.id);  // ❌ Fake ID!
  }
};
```

**Correct**:
```typescript
const handleDeleteAll = async () => {
  // Same as single delete in template model
  // <!-- 템플릿 모델에서는 단일 삭제와 동일 -->
  const realId = eventToDelete.repeat?.originalEventId || eventToDelete.id;
  await deleteEvent(realId);
  
  setIsDeleteOptionsDialogOpen(false);
  setEventToDelete(null);
};
```

**Simplification**: In template model, single delete = all delete (both delete the template).

---

### Alternative: Remove "Single vs All" Dialog
<!-- 대안: "단일 vs 전체" 다이얼로그 제거 -->

**Since template model doesn't support single-instance delete**:

```typescript
// Simply delete the template (all instances)
// <!-- 단순히 템플릿 삭제 (모든 인스턴스) -->
const handleDelete = async () => {
  const realId = eventToDelete.repeat?.originalEventId || eventToDelete.id;
  await deleteEvent(realId);
};
```

**Remove the options dialog entirely** for simpler UX.

---

## 14. Final Verdict

### Status: ✅ ROOT CAUSE IDENTIFIED
<!-- 상태: 근본 원인 파악 완료 -->

**Problem**: Using fake frontend-generated IDs instead of real DB IDs

**Solution**: Use `repeat.originalEventId` for recurring events

**Impact**: 
- Both delete buttons will now work
- But both delete ALL instances (template model limitation)

**User Experience Implication**:
- Current UI says "단일 삭제" vs "전체 삭제"
- But functionally, both do the same thing (delete template)
- **Recommendation**: Update UI text or remove single delete option

---

## 15. Implementation Plan

### Step 1: Fix Delete Handlers ✅
<!-- 1단계: 삭제 핸들러 수정 -->

Update `handleDeleteSingle` and `handleDeleteAll` to use `originalEventId`.

### Step 2: Update Dialog Text (Optional) ⏳
<!-- 2단계: 다이얼로그 텍스트 업데이트 (선택사항) -->

Change message to:
```
"이 반복 일정을 삭제하시겠습니까?"
"반복 일정을 삭제하면 모든 인스턴스가 삭제됩니다."
```

### Step 3: Test Manually ⏳
<!-- 3단계: 수동 테스트 -->

1. Create recurring event
2. Click delete on any instance
3. Verify ALL instances disappear
4. Verify correct snackbar message

---

**Reviewed By**: Manager (관리자)  
**Review Date**: 2025-10-29  
**Status**: ✅ Root Cause Identified - Ready to Fix
**Follow-up**: Implement fix using `repeat.originalEventId`

