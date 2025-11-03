# Workflow Optimization Guide
<!-- 워크플로우 최적화 가이드 -->

**purpose:** Reduce implementation time by eliminating redundant steps and improving efficiency
<!-- 목적: 중복 단계 제거 및 효율성 개선으로 구현 시간 단축 -->

---

## Current Workflow Issues (이번 작업 분석)
<!-- 현재 워크플로우 문제점 (이번 작업 분석) -->

### ❌ Problem 1: 테스트를 너무 자주 실행
<!-- 문제 1: 테스트를 너무 자주 실행 -->

**현재 방식**:
```
Phase 1 RED → 테스트 실행 (실패 확인)
Phase 1 GREEN → 테스트 실행 (통과 확인)
Phase 1 REFACTOR → 테스트 실행 (통과 확인)
Phase 2 RED → 테스트 실행 (실패 확인)
Phase 2 GREEN → 테스트 실행 (통과 확인)
Phase 3 RED → 테스트 실행
Phase 4 → 테스트 실행
Final → 전체 테스트 실행
```
**총 8번 테스트 실행!** ⏱️ ~4분

**개선 방식**:
```
Phase 1-2 작성 완료 → 1번 테스트 실행 (검증)
Phase 3-4 작성 완료 → 1번 테스트 실행 (검증)
Final → 전체 테스트 실행
```
**총 3번 테스트 실행!** ⏱️ ~1.5분 (62% 시간 절감)

---

### ❌ Problem 2: ESLint/Prettier 반복 실행
<!-- 문제 2: ESLint/Prettier 반복 실행 -->

**현재 방식**:
```
중간에 lint 확인 → 실행
코드 수정 후 → 다시 실행
또 수정 → 또 실행
CRLF 문제 → 계속 실행 (해결 안됨)
```
**총 5번 이상 실행!** ⏱️ ~2분

**개선 방식**:
```
구현 완료 → 1번만 실행
CRLF 문제는 별도 처리 (VS Code 설정으로 자동화)
```
**총 1번 실행!** ⏱️ ~25초 (80% 시간 절감)

---

### ❌ Problem 3: 파일 중복 읽기
<!-- 문제 3: 파일 중복 읽기 -->

**현재 방식**:
```
Prerequisites에서 App.tsx 읽기
Phase 1에서 App.tsx 다시 읽기
Phase 2에서 App.tsx 또 읽기
```
**총 3-4번 중복 읽기!**

**개선 방식**:
- 한 번 읽은 파일 정보는 context에 유지
- 수정한 부분만 다시 확인

---

### ❌ Problem 4: Phase별 독립 작업
<!-- 문제 4: Phase별 독립 작업 -->

**현재 방식**:
```
Phase 1 (UI) 완료 → 검증
Phase 2 (Validation) 완료 → 검증
Phase 3 (Rendering) 완료 → 검증
```
각 Phase 사이에 검증 단계

**개선 방식**:
```
Phase 1-2 (UI + Validation) 묶어서 완료 → 1번 검증
Phase 3-4 (Rendering + Integration) 묶어서 완료 → 1번 검증
```
관련된 Phase들을 batch로 처리

---

## Optimized Workflow (최적화된 워크플로우)
<!-- 최적화된 워크플로우 -->

### Step 1: Analyze & Plan (5분)
<!-- 1단계: 분석 및 계획 (5분) -->

```
✓ Read TDD guide
✓ Analyze existing code (all at once)
  - useEventForm.ts
  - types.ts  
  - recurringEventUtils.ts
  - App.tsx (필요한 부분만)
✓ Create implementation plan
```

**한 번에 모든 분석 완료** - 파일 중복 읽기 방지

---

### Step 2: Batch Implementation (UI + Validation)
<!-- 2단계: Batch 구현 (UI + Validation) -->

#### 2.1 Write All Tests First (RED)
```typescript
// src/__tests__/medium.integration.spec.tsx

describe('반복 종료 날짜 UI', () => {
  it('반복 일정 체크 시 반복 종료 날짜 필드가 표시된다', ...);
  it('반복 일정 체크 해제 시 반복 종료 날짜 필드가 숨겨진다', ...);
  it('반복 종료 날짜가 시작 날짜보다 이전이면 에러가 표시된다', ...);
  it('반복 종료 날짜가 시작 날짜와 같으면 에러가 표시되지 않는다', ...);
});
```

**모든 테스트를 한 번에 작성** - 전체 요구사항 파악

#### 2.2 Implement All Features (GREEN)
```typescript
// src/App.tsx
// 1. UI 추가
{isRepeating && (
  <FormControl fullWidth>
    <FormLabel htmlFor="repeat-end-date">반복 종료 날짜</FormLabel>
    <TextField
      id="repeat-end-date"
      type="date"
      size="small"
      value={repeatEndDate}
      onChange={(e) => setRepeatEndDate(e.target.value)}
      // 2. Validation 로직 동시에 추가
      error={repeatEndDate !== '' && date !== '' && repeatEndDate < date}
      helperText={
        repeatEndDate !== '' && date !== '' && repeatEndDate < date
          ? '종료 날짜는 시작 날짜 이후여야 합니다'
          : '(선택사항: 비워두면 무한 반복)'
      }
    />
  </FormControl>
)}
```

**UI와 Validation을 동시에 구현** - Phase 통합

#### 2.3 Test Once
```bash
npm test -- src/__tests__/medium.integration.spec.tsx --run
```

**한 번만 테스트 실행** - 모든 기능 검증

⏱️ **Time Saved: ~2분**

---

### Step 3: Rendering & Integration (10분)
<!-- 3단계: 렌더링 & 통합 (10분) -->

#### 3.1 Check Existing Implementation
```typescript
// src/utils/recurringEventUtils.ts 확인
// 이미 endDate 필터링 구현됨 → 구현 생략!
```

**불필요한 구현 건너뛰기**

#### 3.2 Write Verification Tests
```typescript
// src/__tests__/unit/recurringEventUtils.spec.ts
describe('generateRecurringEvents - endDate filtering', () => {
  it('endDate가 없으면 maxOccurrences까지 무한 반복한다', ...);
  it('endDate가 있으면 해당 날짜까지만 생성한다', ...);
  // ... 5 tests total
});
```

#### 3.3 Write Integration Tests
```typescript
// Week/Month View 통합 테스트
it('endDate가 있는 반복 일정이 종료 날짜까지만 Week View에 표시된다', ...);
it('endDate가 있는 반복 일정이 종료 날짜까지만 Month View에 표시된다', ...);
```

#### 3.4 Test Once
```bash
npm test -- --run
```

⏱️ **Time Saved: ~1.5분**

---

### Step 4: Final Validation (1회만!)
<!-- 4단계: 최종 검증 (1회만!) -->

```bash
# 1. TypeScript
npm run lint:tsc

# 2. ESLint (1번만!)
npm run lint:eslint -- --fix

# 3. Final Test
npm test -- --run
```

**중간 검증 제거, 마지막에 1번만!**

⏱️ **Time Saved: ~2분**

---

## Comparison Table
<!-- 비교 표 -->

| 단계 | 현재 방식 | 최적화 방식 | 시간 절감 |
|------|-----------|-------------|-----------|
| Prerequisites | 10분 (파일 여러 번 읽기) | 5분 (한 번에 분석) | **50%** |
| Phase 1-2 (UI+Validation) | 15분 (분리 작업) | 10분 (통합 작업) | **33%** |
| Phase 3-4 (Rendering+Integration) | 15분 (분리 작업) | 10분 (통합 작업) | **33%** |
| Testing | 8회 실행 (~4분) | 3회 실행 (~1.5분) | **62%** |
| Linting | 5회+ 실행 (~2분) | 1회 실행 (~25초) | **80%** |
| **Total** | **~46분** | **~27분** | **41% 절감** |

---

## Quick Decision Tree
<!-- 빠른 의사결정 트리 -->

### "언제 테스트를 실행하나?"
```
❌ 각 Phase 완료 후마다
✅ 관련된 여러 Phase 완료 후 1번
✅ 최종 완료 후 전체 테스트 1번
```

### "언제 Lint를 실행하나?"
```
❌ 코드 수정할 때마다
❌ 중간 검증 단계에서
✅ 최종 완료 후 1번만!
```

### "언제 파일을 다시 읽나?"
```
❌ 각 Phase 시작할 때마다
✅ 파일이 수정되었을 때만
✅ 에러로 인해 내용 확인이 필요할 때만
```

### "Phase를 어떻게 묶나?"
```
✅ UI + Validation (함께 작동)
✅ Rendering + Integration (함께 작동)
❌ 각 Phase를 독립적으로 처리
```

---

## Best Practices
<!-- 모범 사례 -->

### ✅ DO (하세요)
1. **Batch related work**: UI와 Validation처럼 관련된 작업은 묶어서 처리
2. **Test in batches**: 여러 기능을 구현한 후 한 번에 테스트
3. **Analyze once**: 파일을 한 번에 분석하고 context 유지
4. **Lint at end**: 최종 검증 단계에서만 lint 실행
5. **Skip if exists**: 이미 구현된 기능은 테스트로만 검증

### ❌ DON'T (하지 마세요)
1. **Don't test after every change**: 작은 변경마다 테스트하지 않기
2. **Don't lint repeatedly**: 반복적으로 lint 실행하지 않기
3. **Don't read files multiple times**: 같은 파일 여러 번 읽지 않기
4. **Don't verify CRLF manually**: VS Code 설정으로 자동화
5. **Don't separate related phases**: 관련된 Phase 분리하지 않기

---

## Automation Setup
<!-- 자동화 설정 -->

### VS Code Settings (필수!)
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

**이 설정으로 CRLF 문제 완전 방지!**

---

## Optimized Workflow Template
<!-- 최적화된 워크플로우 템플릿 -->

```markdown
## 1. Analyze (5분)
- [ ] Read prerequisites (TDD guide, existing code)
- [ ] Identify implementation scope
- [ ] Plan phase batching

## 2. Batch Implementation 1 (10분)
- [ ] Write tests for Phase 1-2
- [ ] Implement Phase 1-2 together
- [ ] Run tests ONCE

## 3. Batch Implementation 2 (10분)
- [ ] Write tests for Phase 3-4
- [ ] Implement Phase 3-4 together
- [ ] Run tests ONCE

## 4. Final Validation (2분)
- [ ] npm run lint:tsc
- [ ] npm run lint:eslint -- --fix
- [ ] npm test -- --run

Total: ~27분 (vs 46분)
```

---

## Key Takeaway
<!-- 핵심 요약 -->

> **"Batch related work, Test in groups, Lint once at end"**
> 
> **"관련 작업 묶기, 그룹으로 테스트, 마지막에 한 번만 Lint"**

**Time saved: ~40% per feature implementation**
**시간 절감: 기능 구현당 ~40%**

