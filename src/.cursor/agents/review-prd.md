# Code Review PRD (Product Requirements Document)
<!-- 코드 리뷰 PRD (제품 요구사항 정의서) -->

**Version**: 1.1  
**Last Updated**: 2025-10-29  
**Owner**: Manager (관리자)  
**Changelog**: v1.1 - Added executive summary (오류 요약 + 해결방안 제시) to Section 1

---

## Purpose
<!-- 목적 -->

This document defines the standard structure and guidelines for code review reports.
<!-- 이 문서는 코드 리뷰 보고서의 표준 구조와 가이드라인을 정의합니다. -->

All review files in `src/.cursor/agents/review/` MUST follow this template.
<!-- `src/.cursor/agents/review/` 폴더의 모든 리뷰 파일은 이 템플릿을 따라야 합니다. -->

---

## Review Report Structure
<!-- 리뷰 보고서 구조 -->

### Required Sections (MUST Include)
<!-- 필수 섹션 (반드시 포함) -->

#### 1. Question Analysis (Executive Summary)
<!-- 질문 분석 (요약) -->

**Purpose**: Provide at-a-glance understanding of the review without scrolling
<!-- 목적: 스크롤 없이 리뷰를 한눈에 파악할 수 있도록 제공 -->

**MUST Include at Top** (Above the fold):
<!-- 상단 필수 포함 (스크롤 없이 보이는 영역): -->

1. **Original Question**: User's exact question in Korean
   <!-- 원본 질문: 한국어로 된 사용자의 정확한 질문 -->

2. **🔴 오류 요약**: One-line summary of critical errors found (or "✅ 오류 없음")
   <!-- 오류 요약: 발견된 치명적 오류의 한 줄 요약 (또는 "오류 없음") -->

3. **✅ 해결방안 제시**: One-line summary of recommended solution
   <!-- 해결방안 제시: 권장 해결책의 한 줄 요약 -->

4. **Intent**: What does the user want to achieve?
   <!-- 의도: 사용자가 달성하고자 하는 것은? -->

5. **Scope**: What needs to be reviewed?
   <!-- 범위: 무엇을 검토해야 하는가? -->

6. **Context**: Related PRD, previous work, dependencies
   <!-- 맥락: 관련 PRD, 이전 작업, 의존성 -->

**Example**:
```markdown
## 1. Question Analysis

**Original Question**: "리뷰해. overlapBypassLogic.spec.ts의 오류가 넘쳐난다."
<!-- 원본 질문: -->

**🔴 오류 요약**: 한글 인코딩 손상 + TypeScript 타입 에러 2건 (컴파일 불가)
<!-- 오류 요약: -->

**✅ 해결방안 제시**: UTF-8 인코딩 복원 + RepeatType import 추가 (5분 소요)
<!-- 해결방안 제시: -->

**Intent**: Fix critical errors in test file to enable compilation and testing
<!-- 의도: 테스트 파일의 치명적 오류를 수정하여 컴파일 및 테스트 활성화 -->

**Scope**: `src/__tests__/unit/overlapBypassLogic.spec.ts`
<!-- 범위: -->

**Context**: File created during overlap dialog bug fix, CRLF conversion corrupted encoding
<!-- 맥락: 겹침 다이얼로그 버그 수정 중 생성된 파일, CRLF 변환 시 인코딩 손상 -->
```

**For Success Cases** (No Errors):
```markdown
## 1. Question Analysis

**Original Question**: "리뷰해"
<!-- 원본 질문: -->

**✅ 오류 요약**: 오류 없음 - 모든 품질 기준 충족
<!-- 오류 요약: -->

**✅ 해결방안 제시**: 승인 완료 - 배포 가능 (개선 제안 3건 포함)
<!-- 해결방안 제시: -->

**Intent**: Request formal code review for recent implementation
<!-- 의도: 최근 구현에 대한 공식 코드 리뷰 요청 -->

**Scope**: Review overlap dialog bug fixes
<!-- 범위: 겹침 다이얼로그 버그 수정 검토 -->

**Context**: PRD at `src/.cursor/agents/request/fix-overlap-dialog-bugs.md`
<!-- 맥락: PRD 위치 `src/.cursor/agents/request/fix-overlap-dialog-bugs.md` -->
```

---

#### 2. Referenced Data & Files
<!-- 참조한 데이터 및 파일 -->

**Purpose**: Document all materials reviewed
<!-- 목적: 검토한 모든 자료를 문서화 -->

**Content**:
<!-- 내용: -->
- **PRD Files**: Product requirement documents
  <!-- PRD 파일: 제품 요구사항 문서 -->
- **Implementation Files**: Source code files
  <!-- 구현 파일: 소스 코드 파일 -->
- **Test Files**: Unit/integration test files
  <!-- 테스트 파일: 단위/통합 테스트 파일 -->
- **Documentation**: TDD guide, checklist, etc.
  <!-- 문서: TDD 가이드, 체크리스트 등 -->
- **Historical Context**: Memory, previous reviews
  <!-- 과거 맥락: 메모리, 이전 리뷰 -->

**Example**:
```markdown
## 2. Referenced Data & Files

### PRD Documents
- `src/.cursor/agents/request/fix-overlap-dialog-bugs.md` - Bug fix requirements
- `src/.cursor/agents/request-prd.md` - General PRD template

### Implementation Files
- `src/utils/overlapBypassLogic.ts` - New utility function
- `src/App.tsx` - Dialog UI modifications

### Test Files
- `src/__tests__/unit/overlapBypassLogic.spec.ts` - Unit tests (7 cases)
- `src/__tests__/medium.integration.spec.tsx` - Integration tests

### Guidelines Referenced
- `src/.cursor/agents/doc/tdd.md` - TDD methodology
- `src/.cursor/agents/doc/checklist.md` - Pre-commit checklist
- `src/.cursor/agents/doc/test-guidelines.md` - Test writing standards

### Historical Context
- `src/.cursor/agents/home/memoryHome.md` - Past patterns
- Previous recurring events bug fixes
```

---

#### 3. Error Analysis
<!-- 오류 분석 -->

**Purpose**: Identify issues and provide solutions
<!-- 목적: 이슈를 식별하고 해결책을 제공 -->

**Content Structure**:
<!-- 내용 구조: -->

**A. No Errors Found (Success Case)**:
```markdown
## 3. Error Analysis

### ✅ No Critical Errors Found

**Verification Results**:
- TypeScript: ✅ All types valid
- ESLint: ✅ No lint errors
- Tests: ✅ 7/7 unit tests passing
- TDD Cycle: ✅ Red → Green → Refactor completed
- Integration: ✅ Function properly called from UI

**Conclusion**: Implementation meets all quality standards
```

**B. Errors Found (Failure Case)**:
```markdown
## 3. Error Analysis

### ❌ Errors Detected

#### Error 1: [Error Name]

**Location**: `path/to/file.ts:42`
<!-- 위치: -->

**Issue**: [Describe what's wrong]
<!-- 이슈: 무엇이 잘못되었는지 -->

**Root Cause**: [Why did this happen?]
<!-- 근본 원인: 왜 발생했는가? -->

**Impact**: [What problems does this cause?]
<!-- 영향: 어떤 문제를 야기하는가? -->

**Predicted Fix**:
<!-- 예측 수정: -->
```typescript
// ❌ Before
function buggyCode() {
  // problematic code
}

// ✅ After
function fixedCode() {
  // corrected code
}
```

**Expected Result After Fix**:
<!-- 수정 후 예상 결과: -->
- Test X will pass
- Performance improves by Y%
- User experience enhanced

**Priority**: 🔴 High / 🟡 Medium / 🟢 Low
<!-- 우선순위: -->
```

---

#### 4. Improvement Recommendations
<!-- 개선 방안 -->

**Purpose**: Suggest enhancements beyond bug fixes
<!-- 목적: 버그 수정을 넘어선 개선사항 제안 -->

**Content Categories**:
<!-- 내용 카테고리: -->

**A. Code Quality Improvements**:
```markdown
## 4. Improvement Recommendations

### A. Code Quality

#### Recommendation 1: Add Input Validation
**Current**: Function assumes valid input
**Suggested**: Add type guards and validation

```typescript
// ✅ Improved
export function hasRecurringNormalConflict(
  newEvent: Event | EventForm,
  overlappingEvents: Event[]
): boolean {
  // Add validation
  if (!newEvent || !overlappingEvents) {
    throw new Error('Invalid input');
  }
  
  // Existing logic...
}
```

**Benefit**: Prevents runtime errors with invalid data
**Effort**: Low (1-2 hours)
**Priority**: Medium
```

**B. Test Coverage Improvements**:
```markdown
### B. Test Coverage

#### Recommendation 2: Add Integration Tests
**Current**: Only unit tests for bypass logic
**Suggested**: Add end-to-end test for dialog behavior

**Test Scenario**:
1. Create recurring event
2. Create overlapping normal event
3. Verify "Continue" button appears
4. Click "Continue"
5. Verify form resets

**Benefit**: Ensures UI integration works correctly
**Effort**: Medium (3-4 hours)
**Priority**: High
```

**C. Performance Improvements**:
```markdown
### C. Performance

#### Recommendation 3: Memoize Overlap Calculation
**Current**: Recalculates on every render
**Suggested**: Use `useMemo` hook

**Impact**: Reduces unnecessary calculations
**Effort**: Low (30 minutes)
**Priority**: Low
```

**D. Documentation Improvements**:
```markdown
### D. Documentation

#### Recommendation 4: Add JSDoc Examples
**Current**: Basic function documentation
**Suggested**: Add usage examples

```typescript
/**
 * @example
 * const recurring = { repeat: { type: 'daily' } };
 * const normal = { repeat: { type: 'none' } };
 * hasRecurringNormalConflict(recurring, [normal]); // true
 */
```

**Benefit**: Easier for future developers
**Effort**: Low (1 hour)
**Priority**: Low
```

---

### Optional Sections (Include When Applicable)
<!-- 선택 섹션 (해당 시 포함) -->

#### 5. TDD Process Verification
<!-- TDD 프로세스 검증 -->

**When to Include**: When reviewing implementation work
<!-- 포함 시점: 구현 작업 검토 시 -->

**Content**:
- Red Phase: Failing test written first? ✅/❌
- Green Phase: Minimal code to pass? ✅/❌
- Refactor Phase: Code improved while tests pass? ✅/❌
- Test-first mindset maintained? ✅/❌

---

#### 6. PRD Requirements Achievement
<!-- PRD 요구사항 달성 -->

**When to Include**: When PRD exists for the task
<!-- 포함 시점: 작업에 대한 PRD가 존재할 때 -->

**Content**:
- List each requirement from PRD
- Mark as ✅ (achieved) or ❌ (not achieved)
- Explain any deviations

---

#### 7. Code Quality Metrics
<!-- 코드 품질 지표 -->

**When to Include**: For complex implementations
<!-- 포함 시점: 복잡한 구현에 대해 -->

**Content**:
- TypeScript type safety: ✅/❌
- Naming conventions: ✅/❌
- Code formatting: ✅/❌
- Test coverage: X%
- Cyclomatic complexity: X

---

#### 8. Integration Verification
<!-- 통합 검증 -->

**When to Include**: Always (critical per Checklist #5)
<!-- 포함 시점: 항상 (체크리스트 #5에 따라 중요) -->

**Content**:
- Implementation → Test → **Integration** → Verification
- Verify function is actually called from UI/hooks
- Check end-to-end flow works

**Critical Check**: Avoid "implementation vs integration gap"
<!-- 중요 체크: "구현 vs 통합 격차" 회피 -->

---

#### 9. Known Issues & Follow-ups
<!-- 알려진 이슈 및 후속 작업 -->

**When to Include**: When non-blocking issues exist
<!-- 포함 시점: 차단되지 않는 이슈가 존재할 때 -->

**Content**:
- List known issues
- Explain why they're non-blocking
- Suggest follow-up tasks
- Assign priority levels

---

#### 10. Final Verdict
<!-- 최종 판정 -->

**When to Include**: Always (required)
<!-- 포함 시점: 항상 (필수) -->

**Format**:
```markdown
## Final Verdict

### ✅ APPROVED
<!-- 승인 -->

**OR**

### ⚠️ NEEDS REVISION
<!-- 수정 필요 -->

**OR**

### ❌ REJECTED
<!-- 거부 -->

---

**Approval Reasons**: [List strengths]
<!-- 승인 이유: 강점 나열 -->

**Areas for Improvement**: [List minor issues]
<!-- 개선 영역: 사소한 이슈 나열 -->

**Blocking Issues**: [List critical problems if rejected]
<!-- 차단 이슈: 거부 시 중요 문제 나열 -->

**Next Actions**: [What should happen next?]
<!-- 다음 조치: 다음에 무엇을 해야 하는가? -->
```

---

## Review Guidelines
<!-- 리뷰 가이드라인 -->

### Manager Role Responsibilities
<!-- Manager 역할 책임 -->

When performing review, Manager MUST:
<!-- 리뷰 수행 시 Manager는 반드시: -->

1. **Read PRD** (if exists)
   <!-- PRD 읽기 (존재하는 경우) -->
   - Understand requirements
   - Check if all requirements are met

2. **Reference `doc/` Guidelines**
   <!-- `doc/` 가이드라인 참조 -->
   - `doc/tdd.md` - Verify TDD cycle
   - `doc/checklist.md` - Check pre-commit items
   - `doc/test-guidelines.md` - Validate test quality

3. **Consult Memory**
   <!-- Memory 상담 -->
   - Review `home/memoryHome.md` for past patterns
   - Check for similar issues/solutions in history
   - Learn from previous successes/failures

4. **Verify Integration** (Critical!)
   <!-- 통합 검증 (중요!) -->
   - Function implemented? ✅
   - Tests passing? ✅
   - **Function called from actual code?** ⭐
   - End-to-end flow verified? ✅

5. **Check Code Quality**
   <!-- 코드 품질 확인 -->
   - TypeScript: `npm run lint:tsc`
   - ESLint: `npm run lint:eslint`
   - Tests: `npm test -- --run`
   - CRLF: `git diff --check`

6. **Provide Constructive Feedback**
   <!-- 건설적인 피드백 제공 -->
   - Praise good practices
   - Explain problems clearly
   - Suggest specific improvements
   - Prioritize issues (High/Medium/Low)

---

## Review Checklist
<!-- 리뷰 체크리스트 -->

Before submitting review, verify:
<!-- 리뷰 제출 전 확인: -->

### Section Completeness
<!-- 섹션 완성도 -->
- [ ] Question Analysis completed
- [ ] Referenced files listed
- [ ] Error analysis provided (or confirmed no errors)
- [ ] Improvement recommendations given
- [ ] Final verdict stated

### Quality Checks
<!-- 품질 체크 -->
- [ ] All code snippets have syntax highlighting
- [ ] All verdicts (✅/❌) are justified
- [ ] Priority levels assigned to issues
- [ ] Next actions clearly stated
- [ ] Bilingual comments (English + Korean) used

### Technical Verification
<!-- 기술 검증 -->
- [ ] TypeScript validated
- [ ] ESLint passed
- [ ] Tests executed
- [ ] Integration verified
- [ ] TDD cycle checked (if applicable)

### Documentation Quality
<!-- 문서 품질 -->
- [ ] Clear and professional tone
- [ ] Specific examples provided
- [ ] Code snippets formatted correctly
- [ ] No vague statements ("looks good", "needs work")
- [ ] Actionable recommendations

---

## Review Severity Levels
<!-- 리뷰 심각도 수준 -->

### 🔴 Critical (Blocking)
<!-- 치명적 (차단) -->
- Security vulnerabilities
- Data corruption risks
- Complete feature failure
- No tests for critical logic

**Action**: ❌ REJECT - Must fix before approval
<!-- 조치: 거부 - 승인 전 수정 필수 -->

### 🟡 Major (Should Fix)
<!-- 주요 (수정 권장) -->
- Performance issues
- Poor error handling
- Incomplete test coverage
- TDD cycle violations

**Action**: ⚠️ NEEDS REVISION - Fix recommended but not blocking
<!-- 조치: 수정 필요 - 수정 권장하나 차단 아님 -->

### 🟢 Minor (Can Defer)
<!-- 사소 (연기 가능) -->
- Code style improvements
- Documentation enhancements
- Optimization opportunities
- Non-critical edge cases

**Action**: ✅ APPROVED - Note for future improvement
<!-- 조치: 승인 - 향후 개선 사항으로 기록 -->

---

## Common Review Patterns
<!-- 일반적인 리뷰 패턴 -->

### Pattern 1: Implementation Gap
<!-- 패턴 1: 구현 격차 -->

**Symptom**: Tests pass but feature doesn't work
<!-- 증상: 테스트는 통과하나 기능이 작동하지 않음 -->

**Root Cause**: Function implemented but not called
<!-- 근본 원인: 함수가 구현되었으나 호출되지 않음 -->

**Check**: Search for function calls in actual code
<!-- 확인: 실제 코드에서 함수 호출 검색 -->

```typescript
// ❌ Implemented but unused
export function myFunction() { /* ... */ }

// ✅ Verify it's called somewhere
const result = myFunction(); // In App.tsx or hook
```

---

### Pattern 2: Metadata Loss
<!-- 패턴 2: 메타데이터 손실 -->

**Symptom**: Edit mode breaks recurring events
<!-- 증상: 수정 모드가 반복 일정을 깨뜨림 -->

**Root Cause**: UI creates new object without preserving metadata
<!-- 근본 원인: UI가 메타데이터를 보존하지 않고 새 객체 생성 -->

**Check**: Verify spread operator usage in edit mode
<!-- 확인: 수정 모드에서 spread 연산자 사용 확인 -->

```typescript
// ❌ Loses metadata
const eventData = {
  title: formTitle,
  date: formDate,
  repeat: { type: formType } // originalEventId lost!
};

// ✅ Preserves metadata
const eventData = editingEvent
  ? {
      ...editingEvent, // Spread preserves all fields
      title: formTitle,
      repeat: {
        ...editingEvent.repeat, // Preserve metadata
        type: formType
      }
    }
  : { /* new event */ };
```

---

### Pattern 3: CRLF Issues
<!-- 패턴 3: CRLF 이슈 -->

**Symptom**: Thousands of `Delete ␍` lint errors
<!-- 증상: 수천 개의 `Delete ␍` lint 오류 -->

**Root Cause**: Windows CRLF line endings
<!-- 근본 원인: Windows CRLF 줄바꿈 -->

**Check**: Run `git diff --check`
<!-- 확인: `git diff --check` 실행 -->

**Fix**: Convert to LF using PowerShell
<!-- 수정: PowerShell을 사용하여 LF로 변환 -->

```powershell
$content = Get-Content "file.ts" -Raw
$content = $content -replace "`r`n", "`n"
[System.IO.File]::WriteAllText("file.ts", $content, [System.Text.UTF8Encoding]::new($false))
```

---

## Review Examples
<!-- 리뷰 예시 -->

### Example 1: Success Review
<!-- 예시 1: 성공 리뷰 -->

See: `src/.cursor/agents/review/2025-10-29_overlap-dialog-bug-fix.md`

**Characteristics**:
- All requirements met
- Tests passing
- Clean integration
- Minor improvements suggested
- Verdict: ✅ APPROVED

---

### Example 2: Revision Needed Review
<!-- 예시 2: 수정 필요 리뷰 -->

```markdown
## Final Verdict

### ⚠️ NEEDS REVISION

**Issues Found**:
1. 🟡 No integration tests for new feature
2. 🟡 Missing error handling in API calls
3. 🟢 Code comments need Korean translations

**Required Actions**:
1. Add integration test covering button click → form reset
2. Add try-catch blocks with user-friendly error messages

**Optional Improvements**:
1. Add Korean translations to code comments

**Estimated Effort**: 2-3 hours
**Re-review Required**: Yes
```

---

### Example 3: Rejected Review
<!-- 예시 3: 거부 리뷰 -->

```markdown
## Final Verdict

### ❌ REJECTED

**Critical Issues**:
1. 🔴 No tests written (TDD violated)
2. 🔴 Function implemented but never called (integration gap)
3. 🔴 TypeScript errors present

**Blocking Reasons**:
- Cannot verify functionality without tests
- Feature does not work end-to-end
- Code does not compile

**Required Actions**:
1. Write unit tests (Red → Green → Refactor)
2. Integrate function into App.tsx
3. Fix TypeScript compilation errors
4. Re-submit for review

**Next Steps**: Worker must address all 🔴 issues before re-review
```

---

## File Naming Convention
<!-- 파일 네이밍 규칙 -->

**Format**: `YYYY-MM-DD_task-description.md`

**Examples**:
- ✅ `2025-10-29_overlap-dialog-bug-fix.md`
- ✅ `2025-10-30_recurring-events-refactor.md`
- ✅ `2025-11-01_notification-system-review.md`
- ❌ `review1.md` (not descriptive)
- ❌ `1029_review.md` (wrong format)
- ❌ `overlap-fix.md` (no date)

---

## Review Tone Guidelines
<!-- 리뷰 톤 가이드라인 -->

### Do's ✅
- Be specific and constructive
- Praise good practices
- Explain "why" behind feedback
- Provide code examples
- Suggest alternatives
- Use professional language

### Don'ts ❌
- Don't be vague ("looks good", "fix this")
- Don't criticize without explanation
- Don't ignore positive aspects
- Don't use harsh language
- Don't assume knowledge
- Don't skip justification

---

## Version History
<!-- 버전 히스토리 -->

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.1 | 2025-10-29 | Added executive summary to Section 1 (오류 요약 + 해결방안 제시) | Manager |
| 1.0 | 2025-10-29 | Initial PRD created | Manager |

---

**End of Review PRD**

This document should be referenced when creating any review file in `src/.cursor/agents/review/`.
<!-- 이 문서는 `src/.cursor/agents/review/`에 리뷰 파일을 생성할 때 참조해야 합니다. -->

