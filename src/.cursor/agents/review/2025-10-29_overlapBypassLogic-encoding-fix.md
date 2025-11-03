# Code Review Report
<!-- 코드 리뷰 보고서 -->

**Date**: 2025-10-29  
**Reviewer**: Manager (관리자)  
**Reviewed By**: Worker (노동자)  
**Task**: Fix Encoding and Type Errors in overlapBypassLogic.spec.ts  
**File**: `src/__tests__/unit/overlapBypassLogic.spec.ts`

---

## 1. Question Analysis
<!-- 질문 분석 -->

**Original Question**: "리뷰해. overlapBypassLogic.spec.ts의 오류가 넘쳐난다. 한글 글자가 깨지고 다른 여러 오류도 있다."
<!-- 원본 질문: -->

**🔴 오류 요약**: 한글 인코딩 손상 (전체 파일) + TypeScript 타입 에러 2건 → 컴파일 불가
<!-- 오류 요약: -->

**✅ 해결방안 제시**: UTF-8 인코딩으로 파일 재생성 + RepeatType import 추가 (예상 5분 소요)
<!-- 해결방안 제시: -->

**Intent**: Request review and fix for critical errors in test file
<!-- 의도: 테스트 파일의 치명적 오류 검토 및 수정 요청 -->

**Scope**: `src/__tests__/unit/overlapBypassLogic.spec.ts`
<!-- 범위: -->

**Context**: File created during overlap dialog bug fix implementation, CRLF→LF conversion corrupted UTF-8 encoding
<!-- 맥락: 겹침 다이얼로그 버그 수정 구현 중 생성된 파일, CRLF→LF 변환 중 UTF-8 인코딩 손상 -->

---

## 2. Referenced Data & Files
<!-- 참조한 데이터 및 파일 -->

### Test Files
- `src/__tests__/unit/overlapBypassLogic.spec.ts` - File with errors

### Implementation Files
- `src/utils/overlapBypassLogic.ts` - Implementation being tested
- `src/types.ts` - Type definitions

### Guidelines Referenced
- `src/.cursor/agents/doc/checklist.md` - Pre-commit checklist (CRLF issues)
- `src/.cursor/agents/review-prd.md` - Review PRD template

---

## 3. Error Analysis
<!-- 오류 분석 -->

### ❌ Critical Errors Detected

#### Error 1: Korean Character Encoding Corruption

**Location**: Multiple lines throughout the file
<!-- 위치: 파일 전체의 여러 줄 -->

**Issue**: Korean characters are corrupted and unreadable
<!-- 이슈: 한글 문자가 깨지고 읽을 수 없음 -->

**Examples**:
```typescript
// Line 13
category: '?낅Т',  // ❌ Should be: '업무'

// Line 18
describe('?쇰컲 + ?쇰컲 ?쇱젙 寃뱀묠', () => {  
// ❌ Should be: '일반 + 일반 일정 겹침'

// Line 19
it('?쇰컲 ?쇱젙?쇰━ 寃뱀튂硫?false瑜?諛섑솚?쒕떎 (bypass 遺덇?)', () => {
// ❌ Should be: '일반 일정끼리 겹치면 false를 반환한다 (bypass 불가)'
```

**Root Cause**: Windows CRLF line endings combined with incorrect UTF-8 encoding handling
<!-- 근본 원인: Windows CRLF 줄바꿈과 잘못된 UTF-8 인코딩 처리가 결합됨 -->

**Impact**: 
- ❌ Test descriptions unreadable
- ❌ Test output meaningless
- ❌ Code maintenance extremely difficult
- ❌ Violates code quality standards

**Priority**: 🔴 Critical (Blocking)
<!-- 우선순위: 치명적 (차단) -->

---

#### Error 2: TypeScript Type Errors

**Location**: Line 64
<!-- 위치: 64번 줄 -->

**Issue**: Invalid enum values for `repeatType` parameter
<!-- 이슈: repeatType 매개변수에 대한 잘못된 enum 값 -->

```typescript
// ❌ Line 64 - Type errors
const overlappingEvents = [
  createEvent('1', 'weekly'),   // Error: 'weekly' not assignable
  createEvent('2', 'monthly')   // Error: 'monthly' not assignable
];
```

**Root Cause**: `createEvent` function only accepts `'none' | 'daily' | undefined'`
<!-- 근본 원인: createEvent 함수가 'none' | 'daily' | undefined'만 허용 -->

```typescript
// Line 5 - Function signature
const createEvent = (
  id: string, 
  repeatType: 'none' | 'daily' = 'none'  // ⚠️ Limited to 2 values
): Event => ({ /* ... */ });
```

**But `RepeatType` in types.ts includes more**:
```typescript
// src/types.ts
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
```

**Impact**:
- ❌ TypeScript compilation fails (`npm run lint:tsc`)
- ❌ Test cannot properly verify recurring event logic
- ❌ Incomplete test coverage for all repeat types

**Priority**: 🔴 Critical (Blocking)
<!-- 우선순위: 치명적 (차단) -->

---

## 4. Predicted Fixes
<!-- 예측 수정 -->

### Fix 1: Restore Korean Characters

**Method**: Re-create file with UTF-8 (no BOM) + LF line endings
<!-- 방법: UTF-8 (BOM 없음) + LF 줄바꿈으로 파일 재생성 -->

**Before** (corrupted):
```typescript
category: '?낅Т',
describe('?쇰컲 + ?쇰컲 ?쇱젙 寃뱀묠', () => {
  it('?쇰컲 ?쇱젙?쇰━ 寃뱀튂硫?false瑜?諛섑솚?쒕떎 (bypass 遺덇?)', () => {
```

**After** (fixed):
```typescript
category: '업무',
describe('일반 + 일반 일정 겹침', () => {
  it('일반 일정끼리 겹치면 false를 반환한다 (bypass 불가)', () => {
```

**Process**:
1. Save original test logic structure
2. Re-create file with proper encoding
3. Restore all Korean text correctly
4. Verify with `git diff --check` (no CRLF warnings)

---

### Fix 2: Expand `createEvent` Type Parameter

**Before** (limited):
```typescript
const createEvent = (
  id: string, 
  repeatType: 'none' | 'daily' = 'none'  // ❌ Only 2 types
): Event => ({
  // ...
  repeat: { type: repeatType, interval: 1 },
});
```

**After** (complete):
```typescript
const createEvent = (
  id: string, 
  repeatType: RepeatType = 'none'  // ✅ All repeat types
): Event => ({
  // ...
  repeat: { type: repeatType, interval: 1 },
});
```

**Changes Required**:
1. Import `RepeatType` from types
2. Change parameter type from union to `RepeatType`
3. Verify all test cases compile

---

## 5. Expected Result After Fix
<!-- 수정 후 예상 결과 -->

### TypeScript Compilation
```bash
npm run lint:tsc
# ✅ Expected: No errors
```

### ESLint
```bash
npm run lint:eslint
# ✅ Expected: No errors
```

### CRLF Check
```bash
git diff --check
# ✅ Expected: No CRLF warnings for overlapBypassLogic.spec.ts
```

### Test Execution
```bash
npm test -- overlapBypassLogic.spec.ts --run
# ✅ Expected: 7/7 tests passing with readable output
```

### Test Output Readability
```
✓ src/__tests__/unit/overlapBypassLogic.spec.ts (7 tests)

  ✓ 일반 + 일반 일정 겹침
    ✓ 일반 일정끼리 겹치면 false를 반환한다 (bypass 불가)
  
  ✓ 반복 + 일반 일정 겹침
    ✓ 새 일정이 반복이고 기존이 일반이면 true를 반환한다
    ✓ 새 일정이 일반이고 기존이 반복이면 true를 반환한다
    ✓ 여러 겹침 중 하나라도 반복+일반 조합이면 true를 반환한다
  
  ✓ 반복 + 반복 일정 겹침
    ✓ 반복 일정끼리 겹치면 false를 반환한다 (bypass 불가)
  
  ✓ 엣지 케이스
    ✓ 겹치는 일정이 없으면 false를 반환한다
    ✓ EventForm 타입도 처리할 수 있다
```

---

## 6. Complete Fixed File
<!-- 완전 수정 파일 -->

```typescript
import { Event, EventForm, RepeatType } from '../../types';
import { hasRecurringNormalConflict } from '../../utils/overlapBypassLogic';

describe('hasRecurringNormalConflict >', () => {
  const createEvent = (id: string, repeatType: RepeatType = 'none'): Event => ({
    id,
    title: `Event ${id}`,
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: repeatType, interval: 1 },
    notificationTime: 10,
  });

  describe('일반 + 일반 일정 겹침', () => {
    it('일반 일정끼리 겹치면 false를 반환한다 (bypass 불가)', () => {
      const newEvent = createEvent('new', 'none');
      const overlappingEvents = [createEvent('1', 'none'), createEvent('2', 'none')];

      const result = hasRecurringNormalConflict(newEvent, overlappingEvents);

      expect(result).toBe(false);
    });
  });

  describe('반복 + 일반 일정 겹침', () => {
    it('새 일정이 반복이고 기존이 일반이면 true를 반환한다 (bypass 허용)', () => {
      const newEvent = createEvent('new', 'daily');
      const overlappingEvents = [createEvent('1', 'none')];

      const result = hasRecurringNormalConflict(newEvent, overlappingEvents);

      expect(result).toBe(true);
    });

    it('새 일정이 일반이고 기존이 반복이면 true를 반환한다 (bypass 허용)', () => {
      const newEvent = createEvent('new', 'none');
      const overlappingEvents = [createEvent('1', 'daily')];

      const result = hasRecurringNormalConflict(newEvent, overlappingEvents);

      expect(result).toBe(true);
    });

    it('여러 겹침 중 하나라도 반복+일반 조합이면 true를 반환한다', () => {
      const newEvent = createEvent('new', 'daily');
      const overlappingEvents = [
        createEvent('1', 'daily'), // 반복+반복
        createEvent('2', 'none'), // 반복+일반 ✓
      ];

      const result = hasRecurringNormalConflict(newEvent, overlappingEvents);

      expect(result).toBe(true);
    });
  });

  describe('반복 + 반복 일정 겹침', () => {
    it('반복 일정끼리 겹치면 false를 반환한다 (bypass 불가)', () => {
      const newEvent = createEvent('new', 'daily');
      const overlappingEvents = [createEvent('1', 'weekly'), createEvent('2', 'monthly')];

      const result = hasRecurringNormalConflict(newEvent, overlappingEvents);

      expect(result).toBe(false);
    });
  });

  describe('엣지 케이스', () => {
    it('겹치는 일정이 없으면 false를 반환한다', () => {
      const newEvent = createEvent('new', 'daily');
      const overlappingEvents: Event[] = [];

      const result = hasRecurringNormalConflict(newEvent, overlappingEvents);

      expect(result).toBe(false);
    });

    it('EventForm 타입도 처리할 수 있다', () => {
      const newEventForm: EventForm = {
        title: 'New Event',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };
      const overlappingEvents = [createEvent('1', 'daily')];

      const result = hasRecurringNormalConflict(newEventForm, overlappingEvents);

      expect(result).toBe(true);
    });
  });
});
```

---

## 7. Improvement Recommendations
<!-- 개선 방안 -->

### A. Immediate Actions (High Priority)
<!-- 즉시 조치 (높은 우선순위) -->

#### Recommendation 1: Fix Encoding and Type Errors
**Current**: File has corrupted Korean and TypeScript errors
**Suggested**: Apply complete fixed file above

**Steps**:
1. Replace file contents with fixed version
2. Verify encoding: UTF-8 (no BOM)
3. Verify line endings: LF only
4. Run `npm run lint:tsc` - should pass
5. Run `npm test -- overlapBypassLogic.spec.ts` - 7/7 should pass

**Benefit**: Unblocks development, restores test readability
**Effort**: Low (5 minutes)
**Priority**: 🔴 Critical

---

### B. Preventive Measures (Medium Priority)
<!-- 예방 조치 (중간 우선순위) -->

#### Recommendation 2: Configure Git to Prevent CRLF
**Current**: Windows default causes CRLF issues
**Suggested**: Set Git config and add `.gitattributes`

**Git Config**:
```bash
git config core.autocrlf false
git config core.eol lf
```

**Create `.gitattributes`**:
```
* text=auto eol=lf
*.ts text eol=lf
*.tsx text eol=lf
*.js text eol=lf
*.jsx text eol=lf
*.json text eol=lf
*.md text eol=lf
```

**Benefit**: Prevents future encoding issues
**Effort**: Low (10 minutes)
**Priority**: 🟡 High

---

#### Recommendation 3: Add Pre-Commit Hook for CRLF Check
**Current**: Manual checking required
**Suggested**: Automate with husky

**Setup**:
```bash
npx husky install
npx husky add .husky/pre-commit "git diff --check"
```

**Benefit**: Catches CRLF issues before commit
**Effort**: Low (5 minutes)
**Priority**: 🟡 Medium

---

### C. Test Coverage Enhancement (Low Priority)
<!-- 테스트 커버리지 향상 (낮은 우선순위) -->

#### Recommendation 4: Add Tests for All RepeatType Values
**Current**: Tests only use 'daily', 'weekly', 'monthly'
**Suggested**: Add 'yearly' test case

```typescript
describe('반복 + 반복 일정 겹침 (추가 케이스)', () => {
  it('yearly 반복 일정끼리 겹치면 false를 반환한다', () => {
    const newEvent = createEvent('new', 'yearly');
    const overlappingEvents = [createEvent('1', 'yearly')];

    const result = hasRecurringNormalConflict(newEvent, overlappingEvents);

    expect(result).toBe(false);
  });
});
```

**Benefit**: Complete coverage of all RepeatType values
**Effort**: Low (5 minutes)
**Priority**: 🟢 Low

---

## 8. Root Cause Analysis
<!-- 근본 원인 분석 -->

### Why Did This Happen?
<!-- 왜 발생했는가? -->

**Timeline**:
1. File created with `write` tool during implementation
2. Windows default line ending (CRLF) applied
3. PowerShell conversion attempted: `$content -replace "`r`n", "`n"`
4. UTF-8 encoding corrupted during conversion
5. Korean characters became unreadable

**Contributing Factors**:
1. ❌ No `.gitattributes` to enforce LF
2. ❌ No pre-commit hook to catch CRLF
3. ❌ Windows environment defaults to CRLF
4. ❌ PowerShell conversion handled encoding incorrectly
5. ❌ `createEvent` type parameter too restrictive

**Lessons Learned**:
- Always check encoding after file operations
- Set up `.gitattributes` at project start
- Use proper TypeScript types (RepeatType vs literal union)
- Verify test output readability

---

## 9. Quality Gate Checklist
<!-- 품질 게이트 체크리스트 -->

### Before Fix
- [x] TypeScript: ❌ 2 type errors
- [x] ESLint: ⚠️ Would have errors after TS fix
- [x] Tests: ❌ Cannot run due to compilation errors
- [x] CRLF: ❌ File has CRLF (inferred from corruption)
- [x] Encoding: ❌ Korean characters corrupted
- [x] Readability: ❌ Test descriptions unreadable

### After Fix (Expected)
- [ ] TypeScript: ✅ No errors
- [ ] ESLint: ✅ No errors
- [ ] Tests: ✅ 7/7 passing
- [ ] CRLF: ✅ LF only
- [ ] Encoding: ✅ UTF-8 (no BOM)
- [ ] Readability: ✅ All Korean text readable

---

## 10. Final Verdict
<!-- 최종 판정 -->

### ❌ REJECTED - Critical Errors Require Immediate Fix
<!-- 거부 - 치명적 오류로 즉시 수정 필요 -->

**Critical Issues**:
1. 🔴 Korean character encoding completely corrupted
2. 🔴 TypeScript compilation fails (2 type errors)
3. 🔴 Tests cannot execute
4. 🔴 Code is unmaintainable in current state

**Blocking Reasons**:
- File is non-functional (TypeScript errors)
- Test descriptions are unreadable (encoding corruption)
- Cannot verify test logic or results
- Violates code quality standards

**Impact Assessment**:
- **Severity**: Critical
- **Affected Area**: Test coverage for core feature
- **User Impact**: None yet (tests don't run)
- **Developer Impact**: High (cannot verify implementation)

---

## 11. Required Actions
<!-- 필수 조치 -->

### Immediate (Worker Must Complete)
<!-- 즉시 (Worker가 완료해야 함) -->

1. ✅ **Replace file contents** with fixed version (Section 6)
2. ✅ **Verify encoding**: UTF-8 (no BOM) + LF
3. ✅ **Run validation**:
   ```bash
   npm run lint:tsc  # Must pass
   npm run lint:eslint  # Must pass
   npm test -- overlapBypassLogic.spec.ts --run  # 7/7 must pass
   ```
4. ✅ **Verify test output** is readable in Korean

### Short-term (Within This Session)
<!-- 단기 (이번 세션 내) -->

5. ✅ **Configure Git** to prevent future CRLF issues
6. ✅ **Create `.gitattributes`** file
7. ✅ **Re-run all tests** to ensure nothing broken

### Long-term (Follow-up Task)
<!-- 장기 (후속 작업) -->

8. ⏳ **Add pre-commit hook** for CRLF checking
9. ⏳ **Document** encoding guidelines in project README

---

## 12. Estimated Effort
<!-- 예상 작업량 -->

| Task | Effort | Priority |
|------|--------|----------|
| Fix encoding & type errors | 5 min | 🔴 Critical |
| Verify with tests | 2 min | 🔴 Critical |
| Configure Git | 10 min | 🟡 High |
| Create `.gitattributes` | 5 min | 🟡 High |
| Add pre-commit hook | 5 min | 🟢 Medium |
| **Total** | **27 min** | |

---

## Review Signatures
<!-- 리뷰 서명 -->

**Reviewed by**: Manager (관리자)  
**Review Date**: 2025-10-29  
**Status**: ❌ REJECTED  
**Next Action**: Worker must fix encoding and type errors immediately  
**Re-review Required**: Yes (after fix applied)

---

**Manager's Note**: 
This is a straightforward fix but critical for code quality. The encoding corruption likely happened during the PowerShell CRLF conversion. Going forward, we should set up `.gitattributes` to prevent this class of errors entirely.

**건물주님께**:  
Worker가 수정을 완료하면 즉시 재검토하겠습니다. 예상 소요 시간은 5분입니다.

---

**End of Review Report**

