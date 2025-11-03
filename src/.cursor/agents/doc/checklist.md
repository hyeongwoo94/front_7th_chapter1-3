# Pre-Commit Checklist
<!-- 커밋 전 체크리스트 -->

## Critical Issues to Check Before Commit
<!-- 커밋 전 반드시 확인해야 할 치명적 이슈 -->

### 1. Line Ending Issues (CRLF vs LF)
<!-- 줄바꿈 문자 이슈 (CRLF vs LF) -->

**Problem**: Windows uses CRLF (`\r\n`), but project requires LF (`\n`)
<!-- 문제: Windows는 CRLF를 사용하지만 프로젝트는 LF를 요구함 -->

**Symptoms**:
<!-- 증상: -->
- Thousands of `Delete ␍` prettier/prettier errors
<!-- 수천 개의 `Delete ␍` prettier/prettier 오류 -->
- Every line shows lint error even though code is correct
<!-- 코드가 올바른데도 모든 줄에 lint 오류 표시 -->

**Root Cause**:
<!-- 근본 원인: -->
- `.prettierrc` specifies `"endOfLine": "lf"`
<!-- `.prettierrc`가 `"endOfLine": "lf"`로 지정됨 -->
- Files were created/edited on Windows with CRLF line endings
<!-- Windows에서 CRLF 줄바꿈으로 파일이 생성/편집됨 -->

**Prevention**:
<!-- 예방: -->
1. Set Git config: `git config core.autocrlf false`
<!-- Git 설정: `git config core.autocrlf false` -->
2. Configure VS Code to use LF:
<!-- VS Code를 LF 사용하도록 설정: -->
   - Settings → Files: Eol → `\n`
   - Or set in `.vscode/settings.json`: `"files.eol": "\n"`
   <!-- 또는 `.vscode/settings.json`에 설정: `"files.eol": "\n"` -->

**Solution**:
<!-- 해결 방법: -->

Method 1: VS Code (Recommended)
<!-- 방법 1: VS Code (권장) -->
```
1. Open any file
2. Click "CRLF" in bottom status bar
3. Select "LF"
4. Save file
5. Repeat for all files OR use "Change All End of Line Sequence"
```

Method 2: Git renormalize
<!-- 방법 2: Git 재정규화 -->
```bash
git config core.autocrlf false
git add --renormalize .
git status  # Check changes
```

Method 3: dos2unix (if available)
<!-- 방법 3: dos2unix (사용 가능한 경우) -->
```bash
find src -name "*.ts" -o -name "*.tsx" | xargs dos2unix
```

### 2. Import Order Issues
<!-- Import 순서 이슈 -->

**Problem**: eslint-plugin-import requires specific import grouping
<!-- 문제: eslint-plugin-import가 특정 import 그룹화를 요구함 -->

**Rules**:
<!-- 규칙: -->
1. External libraries (React, MUI, etc.)
<!-- 외부 라이브러리 (React, MUI 등) -->
2. **ONE blank line**
<!-- 빈 줄 하나 -->
3. Internal modules (starting with `.` or `@/`)
<!-- 내부 모듈 (`.` 또는 `@/`로 시작) -->
4. **NO blank lines** within same group
<!-- 같은 그룹 내에서는 빈 줄 없음 -->

**Good Example**:
<!-- 좋은 예: -->
```typescript
import { useState } from 'react';
import { Button } from '@mui/material';
import { useSnackbar } from 'notistack';

import Modal from './components/Modal';
import { useCalendarView } from './hooks/useCalendarView';
import { Event } from './types';
```

**Bad Example**:
<!-- 나쁜 예: -->
```typescript
import { useState } from 'react';
import { Button } from '@mui/material';

import Modal from './components/Modal';  // ❌ Blank line within group

import { useCalendarView } from './hooks/useCalendarView';  // ❌ No blank line between groups
import { Event } from './types';
```

**Fix**: Run `npm run lint:eslint -- --fix` or manually organize imports
<!-- 수정: `npm run lint:eslint -- --fix` 실행 또는 수동으로 import 정리 -->

### 3. File Ending Blank Line
<!-- 파일 마지막 빈 줄 -->

**Problem**: Prettier requires exactly one blank line at end of file
<!-- 문제: Prettier가 파일 끝에 정확히 한 줄의 빈 줄을 요구함 -->

**Rule**: Every file must end with exactly ONE newline character
<!-- 규칙: 모든 파일은 정확히 한 개의 개행 문자로 끝나야 함 -->

**Check**: Look at end of file - cursor should be on empty line after last code
<!-- 확인: 파일 끝 확인 - 커서가 마지막 코드 다음 빈 줄에 있어야 함 -->

**Good**:
<!-- 좋은 예: -->
```typescript
export default Modal;
← cursor here (empty line)
```

**Bad**:
<!-- 나쁜 예: -->
```typescript
export default Modal;← no newline after

export default Modal;

← extra blank line
```

### 4. React Hooks Dependencies
<!-- React Hooks 의존성 -->

**Problem**: Missing dependencies in useEffect/useCallback
<!-- 문제: useEffect/useCallback에 의존성 누락 -->

**Rule**: All values used inside hook must be in dependency array
<!-- 규칙: 훅 내부에서 사용되는 모든 값은 의존성 배열에 있어야 함 -->

**Solution**:
<!-- 해결: -->
- Wrap functions with `useCallback`
<!-- 함수를 `useCallback`으로 감싸기 -->
- Add all dependencies to array
<!-- 모든 의존성을 배열에 추가 -->
- Use ESLint's suggested fix
<!-- ESLint의 제안 수정 사용 -->

**Good Example**:
<!-- 좋은 예: -->
```typescript
const checkUpcomingEvents = useCallback(() => {
  const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);
  // ...
}, [events, notifiedEvents]);  // All dependencies listed

useEffect(() => {
  const interval = setInterval(checkUpcomingEvents, 1000);
  return () => clearInterval(interval);
}, [checkUpcomingEvents]);  // Include callback
```

## Pre-Commit Command Checklist
<!-- 커밋 전 명령어 체크리스트 -->

Run these commands before every commit:
<!-- 매 커밋 전에 다음 명령어 실행: -->

```bash
# 1. Check for CRLF issues
git diff --check

# 2. Run linter
npm run lint:eslint

# 3. Run TypeScript compiler
npm run lint:tsc

# 4. Run all tests
npm test -- --run

# 5. Fix auto-fixable issues
npm run lint:eslint -- --fix
```

## Common Lint Errors and Fixes
<!-- 일반적인 Lint 오류 및 수정 -->

| Error | Meaning | Fix |
|-------|---------|-----|
| `Delete ␍` | CRLF line ending | Convert to LF |
| `There should be at least one empty line between import groups` | Missing blank line between import groups | Add blank line |
| `There should be no empty line within import group` | Extra blank line in same group | Remove blank line |
| `Delete ⏎` | Extra blank line at end of file | Remove extra newline |
| `Insert ⏎` | Missing blank line at end of file | Add newline |
| `React Hook useEffect has a missing dependency` | Missing dependency in hooks | Add to dependency array or use useCallback |

## Automation Setup
<!-- 자동화 설정 -->

### VS Code Settings
<!-- VS Code 설정 -->

Create `.vscode/settings.json`:
<!-- `.vscode/settings.json` 생성: -->
```json
{
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Git Hooks (Optional)
<!-- Git Hooks (선택사항) -->

Use husky to run linting before commit:
<!-- husky를 사용하여 커밋 전 린팅 실행: -->
```bash
npx husky install
npx husky add .husky/pre-commit "npm run lint"
```

## Critical Bug Patterns from Recent Fixes (2025-10-28)
<!-- 최근 수정에서 발견된 치명적 버그 패턴 (2025-10-28) -->

### 5. Implementation vs Integration Gap
<!-- 구현 vs 통합 격차 -->

**Problem**: Function implemented and tested, but not integrated with UI
<!-- 문제: 함수를 구현하고 테스트했지만 UI와 통합하지 않음 -->

**Example**:
<!-- 예시: -->
```typescript
// ✅ Step 1: Implemented
function generateRecurringEvents(event) { /* ... */ }

// ✅ Step 2: Tested (16 tests passing)
describe('generateRecurringEvents', () => { /* ... */ });

// ❌ Step 3: MISSING - Not called from UI/hooks!
// User creates recurring event → Only single event saved
```

**Prevention Checklist**:
<!-- 예방 체크리스트: -->
- [ ] Function implemented?
<!-- 함수 구현 완료? -->
- [ ] Unit tests passing?
<!-- 단위 테스트 통과? -->
- [ ] **Function called from actual code path?** ⭐
<!-- 실제 코드 경로에서 함수 호출? ⭐ -->
- [ ] Integration test verifies end-to-end flow?
<!-- 통합 테스트로 전체 흐름 검증? -->

**Fix Pattern**:
<!-- 수정 패턴: -->
```typescript
// Hook/Component should call the utility
const saveEvent = async (eventData) => {
  if (eventData.repeat.type !== 'none') {
    // ⭐ Integration: Call the implemented function
    const events = generateRecurringEvents(eventData);
    await fetch('/api/events-list', { body: JSON.stringify({ events }) });
  }
};
```

### 6. Date Overflow Filtering (Month-End Dates)
<!-- 날짜 오버플로우 필터링 (월말 날짜) -->

**Problem**: JavaScript Date auto-adjusts invalid dates (Feb 31 → Mar 3)
<!-- 문제: JavaScript Date가 잘못된 날짜를 자동 조정 (2월 31일 → 3월 3일) -->

**Wrong Approach** (Adjust to last day):
<!-- 잘못된 접근 (마지막 날로 조정): -->
```typescript
// ❌ User expects: Only show on 31st days
nextDate.setDate(31);
if (nextDate.getMonth() !== targetMonth) {
  nextDate.setDate(0);  // Set to last day of month (28, 30)
}
// Result: Shows on Feb 28, Apr 30 (user doesn't want this!)
```

**Correct Approach** (Filter by exact day):
<!-- 올바른 접근 (정확한 날짜로 필터링): -->
```typescript
// ✅ Allow overflow, then filter
nextDate.setDate(31);  // May overflow to next month
const shouldAdd = nextDate.getDate() === 31;  // Only add if still 31st
if (shouldAdd) {
  events.push(event);
}
// Result: Only shows on months with 31 days ✅
```

**Key Principle**:
<!-- 핵심 원칙: -->
> Calculate from start date each time, not from previous result
<!-- 이전 결과가 아닌 시작 날짜에서 매번 계산 -->

```typescript
// ❌ Cascading errors
for (let i = 0; i < count; i++) {
  currentDate = getNextOccurrence(currentDate, ...);  // Error accumulates
}

// ✅ Independent calculation
for (let i = 0; i < count; i++) {
  currentDate = getMonthlyOccurrence(startDate, i, interval);  // Clean each time
}
```

### 7. Virtual vs Persistent ID Management
<!-- 가상 ID vs 영구 ID 관리 -->

**Problem**: Using client-generated temporary IDs for server operations
<!-- 문제: 클라이언트가 생성한 임시 ID를 서버 작업에 사용 -->

**Pattern**: When displaying expanded data (1→N), track original source
<!-- 패턴: 확장된 데이터 표시 시 (1→N) 원본 출처 추적 -->

**Bad Example**:
<!-- 나쁜 예: -->
```typescript
// Display expanded events with temp IDs
const expandedEvents = [
  { id: "temp-1", date: "2025-01-31", title: "Meeting" },
  { id: "temp-2", date: "2025-03-31", title: "Meeting" },
];

// ❌ User edits temp-2, try to save with temp ID
PUT /api/events/temp-2  // 404 Not Found!
```

**Good Example**:
<!-- 좋은 예: -->
```typescript
// ✅ Track original ID in metadata
const expandedEvents = [
  { 
    id: "temp-1", 
    date: "2025-01-31",
    repeat: { 
      originalEventId: "db-123",  // ⭐ Track source
      originalDate: "2025-01-31"   // ⭐ Track base date
    }
  },
  { 
    id: "temp-2", 
    date: "2025-03-31",
    repeat: { 
      originalEventId: "db-123",  // ⭐ Same source
      originalDate: "2025-01-31"
    }
  },
];

// User edits temp-2
const updateId = event.repeat?.originalEventId || event.id;
PUT /api/events/db-123  // ✅ Success!
```

**Metadata Tracking Pattern**:
<!-- 메타데이터 추적 패턴: -->
```typescript
interface ExpandedData {
  id: string;              // Virtual ID (for display)
  data: any;               // Expanded data
  metadata: {
    originalId: string;    // Source ID (for updates)
    originalValue: any;    // Base value (for consistency)
  };
}
```

### 8. Nested Object Spread - Metadata Loss
<!-- 중첩 객체 Spread - 메타데이터 손실 -->

**Problem**: Spreading object but re-creating nested object loses metadata
<!-- 문제: 객체 spread 하지만 중첩 객체 재생성으로 메타데이터 손실 -->

**Bad Pattern**:
<!-- 나쁜 패턴: -->
```typescript
// ❌ Removes only id, but nested object still has metadata
const { id, ...eventWithoutId } = event;

const updateData = {
  ...eventWithoutId,  // Contains repeat: { originalEventId, ... }
  repeat: {           // New object overwrites, but...
    type: formType,
    interval: formInterval
  }
};

// Problem: Object spread order can cause unexpected behavior
// eventWithoutId.repeat has originalEventId
// Then we set repeat again → May or may not override completely
```

**Good Pattern**:
<!-- 좋은 패턴: -->
```typescript
// ✅ Explicitly remove BOTH id AND nested object
const { id, repeat, ...cleanData } = event;

const updateData = {
  ...cleanData,       // No repeat object!
  repeat: {           // Completely clean new object
    type: formType,
    interval: formInterval
  }
};
```

**Rule**:
<!-- 규칙: -->
> When overriding nested object, explicitly remove it from spread first
<!-- 중첩 객체를 override할 때, spread에서 먼저 명시적으로 제거 -->

### 9. UI Layer Metadata Preservation
<!-- UI 레이어 메타데이터 보존 -->

**Problem**: UI creates new event object from form data, losing metadata
<!-- 문제: UI가 폼 데이터로 새 이벤트 객체 생성 시 메타데이터 손실 -->

**Bad Pattern** (Form-to-Object Direct Mapping):
<!-- 나쁜 패턴 (폼→객체 직접 매핑): -->
```typescript
// ❌ Creates brand new object from form fields
const eventData = {
  id: editingEvent ? editingEvent.id : undefined,  // Only copies ID
  title: formTitle,
  date: formDate,
  repeat: {                    // Brand new repeat object!
    type: formRepeatType,      // Metadata lost!
    interval: formInterval
  }
};

// Result: repeat.originalEventId is gone!
saveEvent(eventData);  // Will fail to find original event
```

**Good Pattern** (Conditional Preservation):
<!-- 좋은 패턴 (조건부 보존): -->
```typescript
// ✅ Editing: Spread original event, then override with form data
const eventData = editingEvent
  ? {
      ...editingEvent,          // ⭐ Preserves ALL metadata
      title: formTitle,          // Override with form
      date: formDate,
      repeat: {
        ...editingEvent.repeat,  // ⭐ Preserve repeat metadata
        type: formRepeatType,    // Override with form
        interval: formInterval
      }
    }
  : {
      // New event: No metadata needed
      title: formTitle,
      date: formDate,
      repeat: { type: formRepeatType, interval: formInterval }
    };

saveEvent(eventData);  // ✅ Metadata preserved!
```

**3-Link Metadata Chain**:
<!-- 3단계 메타데이터 체인: -->
```
1. Utils: Inject metadata when expanding
   generateRecurringEvents → adds originalEventId

2. UI: Preserve metadata when editing ⭐ (Common mistake here!)
   App.tsx → must spread editingEvent

3. Hooks: Utilize metadata when saving
   useEventOperations → extract originalEventId for API call
```

**Break any link → Entire feature fails!**
<!-- 한 단계라도 끊어지면 전체 기능 실패! -->

### 10. Server ID Protection (Double Defense)
<!-- 서버 ID 보호 (이중 방어) -->

**Problem**: Client may accidentally send virtual ID in request body
<!-- 문제: 클라이언트가 실수로 요청 body에 가상 ID 전송 -->

**Defense Strategy**: Protect at BOTH client and server
<!-- 방어 전략: 클라이언트와 서버 모두에서 보호 -->

**Client Side** (Remove ID from body):
<!-- 클라이언트 측 (body에서 ID 제거): -->
```typescript
// ✅ Never send ID in request body
const { id, ...dataWithoutId } = eventData;

fetch(`/api/events/${persistentId}`, {
  method: 'PUT',
  body: JSON.stringify(dataWithoutId)  // No ID!
});
```

**Server Side** (Ignore body ID, use URL ID):
<!-- 서버 측 (body ID 무시, URL ID 사용): -->
```javascript
// ✅ Protect ID even if client sends it
app.put('/api/events/:id', (req, res) => {
  const id = req.params.id;  // From URL
  const { id: _bodyId, ...bodyWithoutId } = req.body;  // Remove from body
  
  data[index] = {
    ...existingData,
    ...bodyWithoutId,  // No ID here
    id                 // ⭐ Always use URL ID
  };
});
```

**Why Double Defense?**
<!-- 왜 이중 방어? -->
1. Client-side removal prevents accidental sends (human error)
<!-- 클라이언트 제거는 실수로 전송 방지 (사람 실수) -->
2. Server-side protection prevents malicious/buggy clients (security)
<!-- 서버 보호는 악의적/버그있는 클라이언트 방지 (보안) -->

## Key Takeaways
<!-- 핵심 요약 -->

### Coding Standards
<!-- 코딩 표준 -->
- ✅ Always use LF line endings (not CRLF)
<!-- LF 줄바꿈 사용 (CRLF 아님) -->
- ✅ One blank line between import groups
<!-- import 그룹 간 빈 줄 하나 -->
- ✅ No blank lines within import groups
<!-- import 그룹 내에는 빈 줄 없음 -->
- ✅ Exactly one newline at end of file
<!-- 파일 끝에 정확히 한 줄의 개행 -->
- ✅ Wrap functions in useCallback when used in useEffect
<!-- useEffect에서 사용되는 함수는 useCallback으로 감싸기 -->

### Feature Implementation
<!-- 기능 구현 -->
- ✅ Implement → Test → **Integrate** → Verify end-to-end
<!-- 구현 → 테스트 → 통합 → 전체 흐름 검증 -->
- ✅ Date calculations: Always from start, not from previous result
<!-- 날짜 계산: 항상 시작점에서, 이전 결과에서가 아님 -->
- ✅ Expanded data: Track original with metadata
<!-- 확장된 데이터: 메타데이터로 원본 추적 -->
- ✅ Nested object override: Remove from spread first
<!-- 중첩 객체 override: spread에서 먼저 제거 -->
- ✅ Edit mode: Spread original, then override with form
<!-- 수정 모드: 원본 spread, 그 다음 폼으로 override -->
- ✅ ID protection: Remove at client, ignore at server
<!-- ID 보호: 클라이언트에서 제거, 서버에서 무시 -->

### Pre-Commit
<!-- 커밋 전 -->
- ✅ Run `npm run lint` before committing
<!-- 커밋 전에 `npm run lint` 실행 -->
- ✅ Run `npm test -- --run` to verify integration
<!-- `npm test -- --run` 실행하여 통합 검증 -->
- ✅ Fix CRLF issues immediately when they appear
<!-- CRLF 문제가 나타나면 즉시 수정 -->

