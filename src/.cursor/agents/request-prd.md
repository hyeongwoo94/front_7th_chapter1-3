# PRD Template - Product Requirement Document
<!-- PRD 템플릿 - 제품 요구사항 문서 -->

**purpose:** Template for creating feature request documents in `request/` folder
<!-- 목적: `request/` 폴더에 기능 요청 문서 생성을 위한 템플릿 -->

**usage:** Copy this template → Fill in sections → Save to `request/[feature-name].md`
<!-- 사용법: 이 템플릿 복사 → 섹션 채우기 → `request/[기능명].md`에 저장 -->

---

# Feature Request: [Feature Name]
<!-- 기능 요청: [기능명] -->

**Date**: YYYY-MM-DD
**Requester**: [User/King]
**Status**: ⏳ Pending Review | ✅ Approved | ❌ Rejected

---

## 1. Feature Overview
<!-- 기능 개요 -->

**What**: [1-sentence description of the feature]
<!-- 무엇을: 기능에 대한 한 문장 설명 -->

**Why**: [Business/user value]
<!-- 왜: 비즈니스/사용자 가치 -->

**User Story**: As a [user], I want to [action], so that [benefit]
<!-- 사용자 스토리: [사용자]로서, [행동]을 하고 싶습니다, [이익]을 위해 -->

---

## 2. Input → Output ⭐
<!-- 입력 → 출력 ⭐ -->

### Input (사용자 행동)
```
User Action:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Current State (Before):
[UI 상태 또는 데이터 구조]
```

### Process (변환 과정)
```
1. [처리 단계 1]
2. [처리 단계 2]
3. [처리 단계 3]
```

### Output (예상 결과)
```
After State:
[변경된 UI 상태 또는 데이터 구조]

Expected Notification/Feedback:
[사용자에게 보여질 피드백]
```

### Example
```
Before: [구체적인 예시 - 실제 데이터]
Action: [사용자가 실제로 하는 행동]
After: [결과 - 실제 데이터]
```

---

## 3. Technical Requirements (Optional)
<!-- 기술 요구사항 (선택사항) -->

### Data Model Changes
```typescript
// 필요한 경우만 작성
interface Example {
  // ...
}
```

### UI Components
- [ ] Component to create: [이름]
- [ ] Component to modify: [이름]

### API/Storage Changes
- [ ] New endpoint/method: [설명]
- [ ] Modified data structure: [설명]

---

## 4. Implementation Checklist
<!-- 구현 체크리스트 -->

### Must Have (필수)
- [ ] [필수 기능 1]
- [ ] [필수 기능 2]
- [ ] [필수 기능 3]

### Nice to Have (선택)
- [ ] [선택 기능 1]
- [ ] [선택 기능 2]

### Edge Cases to Handle
- [ ] [엣지 케이스 1]
- [ ] [엣지 케이스 2]

---

## 5. Success Criteria
<!-- 성공 기준 -->

**Feature is complete when:**
- [ ] All "Must Have" items work
- [ ] Input → Output matches specification
- [ ] Edge cases handled
- [ ] Tests pass
- [ ] Code follows .cursorrules

---

## 6. Questions/Concerns (Optional)
<!-- 질문/우려사항 (선택사항) -->

**Unclear points:**
- [질문 1]
- [질문 2]

**Potential issues:**
- [우려사항 1]
- [우려사항 2]

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

---

## 7. Error Recovery Process ⚠️
<!-- 오류 복구 프로세스 ⚠️ -->

**When same error occurs 2+ times during implementation:**
<!-- 구현 중 같은 오류가 2번 이상 발생할 때: -->

### Step 1: Immediate Pause ⏸️
<!-- 1단계: 즉시 중단 -->

**Trigger**: Same error/test failure occurs twice despite fixes
<!-- 트리거: 수정했는데도 같은 오류/테스트 실패가 두 번 발생 -->

**Action**: 
```
1. Stop current implementation immediately
   <!-- 현재 구현 즉시 중단 -->
2. Document the error pattern
   <!-- 오류 패턴 문서화 -->
3. Do NOT attempt third fix
   <!-- 세 번째 수정 시도하지 말 것 -->
```

### Step 2: Conduct Review 🔍
<!-- 2단계: 리뷰 실시 -->

**Action**: Create review document in `review/` folder
<!-- 작업: `review/` 폴더에 리뷰 문서 생성 -->

**Review Document Must Include**:
```markdown
# Code Review Report

**Date**: YYYY-MM-DD
**Task**: [작업명]
**Status**: ⚠️ PAUSED DUE TO RECURRING ERROR

## Error Pattern
<!-- 오류 패턴 -->
**Error**: [오류 메시지]
**Occurrences**: [1차 발생 상황], [2차 발생 상황]
**Attempted Fixes**: [시도한 해결책들]

## Root Cause Analysis
<!-- 근본 원인 분석 -->
**Why error occurred**: [분석]
**Why fixes didn't work**: [분석]
**Missing understanding**: [부족했던 이해]

## Detailed Solutions
<!-- 상세 해결방안 -->
1. **Solution 1**: [구체적 해결책 + 코드 예시]
2. **Solution 2**: [대안 해결책]
3. **Prevention**: [재발 방지책]

## Updated Prerequisites
<!-- 업데이트된 전제조건 -->
- [ ] [새로 필요한 이해사항 1]
- [ ] [새로 필요한 유틸리티/헬퍼 1]
- [ ] [새로 필요한 설정 1]
```

**Reference**: Check existing reviews for pattern
- `review/2025-10-29_integration-test-recurring-event-issue-v2.md`
- Other review files in `review/` folder

### Step 3: Update This PRD 📝
<!-- 3단계: 이 PRD 업데이트 -->

**Action**: Modify the request document based on review findings
<!-- 작업: 리뷰 결과를 바탕으로 request 문서 수정 -->

**What to Add/Modify**:

**A. Add to Section 3 (Technical Requirements)**:
```markdown
### Prerequisites (New)
<!-- 전제조건 (신규) -->
**MUST complete before implementation:**
- [ ] [리뷰에서 발견한 필수 준비사항 1]
- [ ] [리뷰에서 발견한 필수 준비사항 2]
- [ ] [필요한 헬퍼/유틸리티 생성]

**MUST understand before coding:**
- [ ] [리뷰에서 발견한 이해 필요 사항 1]
- [ ] [기존 시스템 동작 방식 X]
```

**B. Add to Section 4 (Implementation Checklist)**:
```markdown
### Error Prevention (New)
<!-- 오류 방지 (신규) -->
**Based on previous attempt failures:**

**Before each step:**
- [ ] [리뷰에서 발견한 체크포인트 1]
- [ ] [리뷰에서 발견한 체크포인트 2]

**Known Pitfalls:**
- ⚠️ [함정 1]: [해결책]
- ⚠️ [함정 2]: [해결책]
```

**C. Add New Section: "Known Issues & Solutions"**:
```markdown
## 8. Known Issues & Solutions (New)
<!-- 알려진 문제 및 해결책 (신규) -->

### Issue 1: [이슈 제목]
**Symptom**: [증상]
**Root Cause**: [원인]
**Solution**: [해결책 + 코드 예시]

### Issue 2: [이슈 제목]
**Symptom**: [증상]
**Root Cause**: [원인]
**Solution**: [해결책 + 코드 예시]
```

### Step 4: Restart Implementation 🔄
<!-- 4단계: 구현 재시작 -->

**Before Restart - Verification Checklist**:
```
- [ ] Review document created in review/ folder
- [ ] PRD updated with new prerequisites
- [ ] PRD updated with error prevention checklist
- [ ] PRD updated with known issues section
- [ ] All prerequisites from review are ready
- [ ] Root cause is understood
- [ ] Solution approach is clear
```

**Restart Protocol**:
1. ✅ Read updated PRD completely
2. ✅ Complete all new prerequisites
3. ✅ Follow new error prevention checklist
4. ✅ Implement with solutions from review
5. ⚠️ If same error occurs again → Escalate to King for approach change

### Step 5: Post-Implementation Update 📊
<!-- 5단계: 구현 후 업데이트 -->

**After successful completion**:
```markdown
Add to bottom of this PRD:

---

## Implementation History
<!-- 구현 이력 -->

### Attempt 1: [날짜]
- **Status**: ❌ Failed
- **Error**: [오류 설명]
- **Review**: [리뷰 파일 링크]

### Attempt 2: [날짜]  
- **Status**: ✅ Success
- **Changes**: [PRD에 추가된 내용 요약]
- **Key Learnings**: [핵심 교훈 3가지]
```

---

### Example: Error Recovery in Action
<!-- 예시: 실제 오류 복구 프로세스 -->

```
Scenario: Integration test fails twice

1️⃣ First Failure:
   - Test: "반복 일정 단일 수정"
   - Error: "Unable to find element: 특별 회의"
   - Fix: Added await
   - Result: Still failed

2️⃣ Second Failure (TRIGGER):
   - Same test still fails
   - Same error message
   - Fix: Increased timeout
   - Result: Still failed
   → ⏸️ PAUSE IMPLEMENTATION

3️⃣ Review:
   - Create: review/2025-10-29_recurring-test-failure.md
   - Found: Mock data not loaded, async timing issue
   - Solution: Need test helpers for async handling

4️⃣ Update PRD:
   - Add Section 3: Prerequisites
     * Create asyncHelpers.ts BEFORE tests
     * Create mockHelpers.ts BEFORE tests
   - Add Section 4: Error Prevention
     * Always use waitForEventInList()
     * Never use immediate getByText() after state change
   - Add Section 8: Known Issues
     * Issue: Element not found
     * Solution: Use proper wait helpers

5️⃣ Restart:
   - ✅ Create asyncHelpers.ts first
   - ✅ Create mockHelpers.ts first  
   - ✅ Use helpers in all tests
   - ✅ Tests pass successfully

6️⃣ Document:
   - Add Implementation History to PRD
   - Record: Attempt 1 failed, Attempt 2 succeeded
   - Key Learning: Always create test utilities first
```

---

### When to Use This Process
<!-- 이 프로세스를 사용해야 할 때 -->

**✅ YES - Use this process when:**
- Same test fails twice with same error
- Same bug reappears after "fix"
- Implementation stuck on same issue 2+ times
- Approach isn't working despite multiple attempts

**❌ NO - Don't use for:**
- Different errors (new issues)
- Typos or simple syntax errors
- First occurrence of any error
- Expected TDD failures (Red phase)

---

### Success Metrics
<!-- 성공 지표 -->

**This process is working when:**
- Second attempt succeeds after review
- Same error doesn't occur third time
- PRD becomes more comprehensive over time
- Future similar features reference updated PRD

**This process needs improvement when:**
- Still failing after PRD update
- Review doesn't find root cause
- Third attempt still has issues
→ Escalate to King for architecture review

---

# 📚 Template Usage Guide
<!-- 템플릿 사용 가이드 -->

## For Planner (계획자)
<!-- 계획자용 -->

**When to create request document:**
- King issues new feature requirement
- User requests new functionality

**How to fill:**
1. **Copy this template** to `request/[feature-name].md`
2. **Section 1**: Summarize what and why
3. **Section 2 ⭐**: MOST IMPORTANT - Clear Input→Output with examples
4. **Section 3**: Technical details (if needed)
5. **Section 4**: Break down into checklist
6. **Section 5**: Define success criteria
7. **Section 6**: List any questions for user
8. **Save and notify user** for confirmation

**References to consult:**
- `memoryHome.md`: Past patterns
- `planerHome.md`: Planning workflows
- History files: Similar past features

## For User (사용자)
<!-- 사용자용 -->

**What to review:**
1. **Section 2**: Does Input→Output match your expectation?
2. **Section 4**: Are "Must Have" items correct?
3. **Section 5**: Are success criteria clear?
4. **Section 6**: Answer any questions

**How to approve:**
1. Read the document
2. Add comments if needed
3. Check one of: ✅ Approved / 🔄 Revise / ❌ Rejected
4. Notify King/Planner

## For Worker (노동자)
<!-- 노동자용 -->

**After user approval:**
1. Read **Section 2** (Input→Output) carefully
2. Follow **Section 4** (Checklist) during implementation
3. Verify **Section 5** (Success Criteria) before completion
4. Reference documents:
   - `memoryHome.md`: Patterns
   - `company/test-team.md`: Testing
   - `company/feature-team.md`: Implementation

**⚠️ CRITICAL: Error Recovery Protocol**
<!-- 오류 복구 프로토콜 -->

**IF same error occurs twice:**
```
🔴 STOP immediately
📝 Follow Section 7: Error Recovery Process
1. Pause implementation
2. Create review document
3. Update this PRD
4. Restart with updated PRD
```

**DO NOT:**
- ❌ Try the same fix three times
- ❌ Continue without understanding root cause
- ❌ Skip review process
- ❌ Ignore recurring patterns

**Success Pattern:**
```
Error 1 → Fix → Error 2 (SAME) → 🛑 PAUSE → Review → Update PRD → Restart → ✅ Success
```

---

# 📋 Quick Examples
<!-- 빠른 예시 -->

## Example 1: Simple Feature
```markdown
# Feature Request: Add Dark Mode Toggle

## 1. Feature Overview
**What**: Add a toggle button to switch between light and dark themes
**Why**: Users want to reduce eye strain at night
**User Story**: As a user, I want to toggle dark mode, so that I can use the app comfortably at night

## 2. Input → Output
### Input
User clicks "Dark Mode" toggle button in settings

Current State: Light theme active

### Output
After State: Dark theme applied to entire app
Notification: "다크 모드가 활성화되었습니다"

### Example
Before: Background white, text black
Action: Click toggle
After: Background dark gray, text white

## 4. Implementation Checklist
### Must Have
- [ ] Toggle button in settings
- [ ] Theme persists after page reload
- [ ] All components respect theme

## 5. Success Criteria
- [ ] Toggle works
- [ ] Theme persists
- [ ] No color contrast issues
```

## Example 2: Complex Feature
```markdown
# Feature Request: Recurring Event Bulk Edit

## 1. Feature Overview
**What**: Edit all instances of recurring event at once
**Why**: Users need to update recurring meetings without editing each one
**User Story**: As a calendar user, I want to bulk edit recurring events, so that I save time

## 2. Input → Output
### Input
1. Click recurring event
2. Click "수정"
3. Modal asks: "해당 일정만 수정하시겠어요?"
4. Click "아니오"
5. Modify fields
6. Click "저장"

Current State: 50 recurring events (weekly team meeting)

### Output
After State: All 50 instances updated
Recurring icon 🔁 maintained

### Example
Before: "팀 스탠드업" 10:00-11:00 (50 instances)
Action: Change to "팀 데일리" 09:30-10:30
After: "팀 데일리" 09:30-10:30 (50 instances, all updated)

## 4. Implementation Checklist
### Must Have
- [ ] Modal question UI
- [ ] Bulk update logic
- [ ] Preserve recurring metadata

### Edge Cases
- [ ] 1000+ instances performance
- [ ] Previously singularized instances not affected

## 5. Success Criteria
- [ ] All instances update
- [ ] Recurring icon maintained
- [ ] < 1s for 1000 instances
```

---

# 🎯 Key Principles
<!-- 핵심 원칙 -->

1. **Section 2 is SOURCE OF TRUTH**: Input→Output defines everything
   <!-- 섹션 2가 단일 진실 공급원: Input→Output이 모든 것을 정의 -->

2. **Concrete Examples > Abstract Descriptions**: Show real data, not theory
   <!-- 구체적 예시 > 추상적 설명: 이론이 아닌 실제 데이터 표시 -->

3. **User Confirmation is Mandatory**: No implementation without approval
   <!-- 사용자 컨펌 필수: 승인 없이 구현 없음 -->

4. **Keep it Simple**: If unsure, ask user. Don't guess.
   <!-- 단순하게 유지: 불확실하면 사용자에게 질문. 추측하지 말 것 -->

5. **Error Recovery is Built-In**: Same error twice = Pause & Review (Section 7)
   <!-- 오류 복구는 내장됨: 같은 오류 2번 = 일시중지 & 리뷰 (섹션 7) -->
   - Prevents wasting time on wrong approach
   <!-- 잘못된 접근으로 시간 낭비 방지 -->
   - Builds knowledge into PRD for future
   <!-- 미래를 위해 PRD에 지식 축적 -->
   - Makes second attempt much more likely to succeed
   <!-- 두 번째 시도 성공 가능성 대폭 증가 -->

---

**PRD Template Version**: 4.0 (2025-10-29 - Added Error Recovery Process)
<!-- PRD 템플릿 버전: 4.0 (2025-10-29 - 오류 복구 프로세스 추가) -->

**What's New in v4.0:**
- ✅ Section 7: Error Recovery Process (5-step protocol)
- ✅ Automatic review trigger on 2nd error occurrence
- ✅ PRD self-update mechanism
- ✅ Implementation History tracking
- ✅ Worker error recovery protocol in Usage Guide

