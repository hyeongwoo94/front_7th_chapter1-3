# Feature Request: Repeat Type Background Colors
<!-- 기능 요청: 반복 유형별 배경색 -->

**Date**: 2025-10-29
**Requester**: User
**Status**: ✅ Approved

---

## 1. Feature Overview
<!-- 기능 개요 -->

**What**: Apply different background colors to calendar events based on repeat type (daily, weekly, monthly, yearly)
<!-- 무엇을: 반복 유형(매일, 매주, 매달, 매년)에 따라 캘린더 일정에 다른 배경색 적용 -->

**Why**: Visual differentiation helps users quickly identify repeat frequency at a glance
<!-- 왜: 시각적 구분으로 사용자가 반복 빈도를 한눈에 빠르게 식별 가능 -->

**User Story**: As a calendar user, I want to see different background colors for different repeat types, so that I can quickly distinguish daily/weekly/monthly/yearly events without reading the repeat icon
<!-- 사용자 스토리: 캘린더 사용자로서, 반복 유형별로 다른 배경색을 보고 싶습니다, 반복 아이콘을 읽지 않고도 매일/매주/매달/매년 일정을 빠르게 구분하기 위해 -->

---

## 2. Input → Output ⭐
<!-- 입력 → 출력 ⭐ -->

### Input (사용자 행동)
```
User Action:
1. 캘린더 월간/주간 뷰에서 일정 확인
2. 일정들의 배경색 관찰

Current State (Before):
- 모든 반복 일정의 배경색: #f5f5f5 (회색)
- 알림된 일정만 #ffebee (빨간색)
- 반복 유형 구분 불가능 (아이콘으로만 구분)
```

### Process (변환 과정)
```
1. 일정의 repeat.type 확인
2. repeat.type에 따라 배경색 매핑
   - daily → [색상 1]
   - weekly → [색상 2]
   - monthly → [색상 3]
   - yearly → [색상 4]
3. 알림 상태는 기존 로직 유지 (우선순위 높음)
```

### Output (예상 결과)
```
After State:
- 매일 반복 (daily): [제안색: #e3f2fd - 연한 파란색]
- 매주 반복 (weekly): [제안색: #f3e5f5 - 연한 보라색]
- 매달 반복 (monthly): [제안색: #fff3e0 - 연한 주황색]
- 매년 반복 (yearly): [제안색: #e8f5e9 - 연한 녹색]
- 반복 없음 (none): #f5f5f5 (기존 회색 유지)
- 알림된 일정: #ffebee (빨간색, 최우선)

Expected Feedback:
- 사용자가 반복 유형을 색상으로 즉시 인식
- 반복 아이콘과 색상의 이중 시각적 힌트
```

### Example
```
Before:
- "팀 데일리" (daily) → 배경: #f5f5f5 (회색) 🔁
- "주간 회의" (weekly) → 배경: #f5f5f5 (회색) 🔁
- "월간 리뷰" (monthly) → 배경: #f5f5f5 (회색) 🔁
- "생일" (yearly) → 배경: #f5f5f5 (회색) 🔁

Action: 반복 유형별 배경색 적용

After:
- "팀 데일리" (daily) → 배경: #e3f2fd (파란색) 🔁
- "주간 회의" (weekly) → 배경: #f3e5f5 (보라색) 🔁
- "월간 리뷰" (monthly) → 배경: #fff3e0 (주황색) 🔁
- "생일" (yearly) → 배경: #e8f5e9 (녹색) 🔁
```

---

## 3. Technical Requirements
<!-- 기술 요구사항 -->

### Files to Modify
- `src/App.tsx` (line 526): Event background color logic in `renderMonthView()`
- Potentially: `renderWeekView()` if it has similar event rendering

### Current Code (App.tsx:526)
```typescript
backgroundColor: isNotified ? '#ffebee' : '#f5f5f5',
```

### Proposed Change
```typescript
const getRepeatBackgroundColor = (repeatType: RepeatType, isNotified: boolean): string => {
  if (isNotified) return '#ffebee'; // Notification takes priority
  
  switch (repeatType) {
    case 'daily': return '#e3f2fd';   // Light blue
    case 'weekly': return '#f3e5f5';  // Light purple
    case 'monthly': return '#fff3e0'; // Light orange
    case 'yearly': return '#e8f5e9';  // Light green
    case 'none':
    default: return '#f5f5f5';        // Gray (non-repeating)
  }
};

// Usage:
backgroundColor: getRepeatBackgroundColor(event.repeat.type, isNotified),
```

### Color Palette Rationale
<!-- 색상 팔레트 근거 -->
- **파란색 (daily)**: 매일 = 하늘처럼 항상 있음
- **보라색 (weekly)**: 매주 = 중간 빈도
- **주황색 (monthly)**: 매달 = 따뜻한 느낌, 덜 빈번
- **녹색 (yearly)**: 매년 = 생일/기념일, 자연스러운 순환

**사용자에게 확인 필요**: 
- 이 색상들이 마음에 드시나요?
- 다른 색상을 원하시나요?

---

## 4. Implementation Checklist
<!-- 구현 체크리스트 -->

### Must Have (필수)
- [ ] `getRepeatBackgroundColor()` 헬퍼 함수 생성
- [ ] `renderMonthView()`에서 배경색 로직 적용
- [ ] `renderWeekView()`에서 배경색 로직 적용 (동일하게)
- [ ] 알림 우선순위 유지 (알림된 일정은 항상 빨간색)
- [ ] 반복 없는 일정은 기존 회색 유지

### Nice to Have (선택)
- [ ] 색상을 상수로 분리 (`src/constants/colors.ts`)
- [ ] 다크모드 고려 (현재는 라이트모드만)

### Edge Cases to Handle
- [ ] `event.repeat`가 undefined인 경우 처리
- [ ] `event.repeat.type`이 'none'인 경우
- [ ] 알림과 반복이 동시에 있는 경우 (알림 우선)

---

## 5. Success Criteria
<!-- 성공 기준 -->

**Feature is complete when:**
- [ ] 매일 반복 일정이 파란색 배경
- [ ] 매주 반복 일정이 보라색 배경
- [ ] 매달 반복 일정이 주황색 배경
- [ ] 매년 반복 일정이 녹색 배경
- [ ] 반복 없는 일정은 회색 배경 (기존과 동일)
- [ ] 알림된 일정은 반복 유형과 상관없이 빨간색 배경
- [ ] 월간 뷰와 주간 뷰 모두 동일하게 적용
- [ ] TypeScript 타입 에러 없음
- [ ] 기존 기능 정상 동작 (일정 클릭, 수정, 삭제 등)

---

## 6. Questions/Concerns
<!-- 질문/우려사항 -->

**사용자 확인 필요:**
1. **색상 선택**: 제안된 색상이 괜찮으신가요?
   - 매일: #e3f2fd (연한 파란색)
   - 매주: #f3e5f5 (연한 보라색)
   - 매달: #fff3e0 (연한 주황색)
   - 매년: #e8f5e9 (연한 녹색)
   
   → 다른 색상을 원하시면 말씀해 주세요!

2. **알림 우선순위**: 알림된 일정은 빨간색이 우선이 맞나요?
   
   → 현재: 알림 > 반복 유형
   
   대안: 반복 유형 배경 + 빨간 테두리?

3. **반복 아이콘 유지**: 색상과 함께 반복 아이콘(🔁)도 계속 표시하나요?
   
   → 추천: 색상 + 아이콘 둘 다 (이중 힌트)

---

## User Confirmation
<!-- 사용자 컨펌 -->

**Status**: ⏳ Awaiting user confirmation
<!-- 상태: 사용자 컨펌 대기 중 -->

**King의 검토 의견**:
<!-- King's Review Comments -->
```
✅ 요구사항 명확함
⚠️ 색상 선택을 사용자가 최종 결정해야 함
✅ 구현 난이도 낮음 (간단한 함수 추가)
✅ 기존 기능 영향 없음
```

**사용자 확인 필요 사항**:
<!-- User needs to confirm -->
1. 제안된 색상 승인 또는 변경 요청
2. 알림 우선순위 정책 확인
3. 반복 아이콘 유지 여부 확인

**User Comments**:
```
[여기에 피드백 작성해 주세요]
- 색상 변경 원하시면: "매일은 노란색으로 변경" 등
- 알림 우선순위 변경 원하시면: "알림도 색상별로 구분" 등
- 기타 요구사항
```

**Final Decision**: 
- [x] ✅ Approved - Proceed with implementation
- [ ] 🔄 Revise - Need changes (specify below)
- [ ] ❌ Rejected - Do not implement

**Revision Notes** (if applicable):
```
[수정 필요 사항]
```

---

## 7. Error Recovery Process ⚠️
<!-- 오류 복구 프로세스 -->

**This is a simple feature, but if issues occur:**

### Likely Issues
1. TypeScript error: `event.repeat` possibly undefined
   - **Solution**: Optional chaining `event.repeat?.type`
   
2. Color not showing in UI
   - **Solution**: Check MUI `sx` prop syntax, ensure color string format
   
3. Week view not updated
   - **Solution**: Apply same logic to both `renderMonthView()` and `renderWeekView()`

### If Same Error Occurs Twice
→ Follow Section 7 protocol from template:
1. Pause implementation
2. Create review document
3. Update this PRD
4. Restart with updated approach

---

## 참고 문서
<!-- Reference Documents -->

**구현 시 참고:**
- `src/.cursor/agents/doc/tdd.md` - TDD 사이클
- `src/.cursor/agents/home/memoryHome.md` - 코드 패턴
- `src/App.tsx` (line 86-99) - `getRepeatIcon()` 함수 (유사한 패턴)

**기존 반복 일정 기능:**
- `src/utils/recurringEventUtils.ts` - 반복 일정 생성 로직
- `src/types.ts` - `RepeatType` 타입 정의

---

**Created by**: Planner (계획자)
**Next Step**: User confirmation → Worker implementation

