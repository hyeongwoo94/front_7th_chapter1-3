# Recurring Overlap Move Fix - PRD
<!-- 반복 일정 단일화 후 동일 날짜 이동 시 겹침 손실 버그 수정 - PRD -->

## 1. Feature Overview
<!-- 기능 개요 -->
- What: Fix data loss when two singleized instances from a daily recurring series are moved to the same date; both events must coexist even if times overlap.
<!-- 무엇: 매일 반복 일정에서 단일화된 두 인스턴스를 같은 날로 이동 시 데이터 소실 방지. 시간 겹침이어도 두 일정이 공존해야 함. -->
- Why: Current behavior loses one instance after overlap confirmation, causing user data loss and breaking expectations.
<!-- 왜: 겹침 확인 후 하나가 소실되는 현재 동작은 사용자 데이터 손실과 기대 위반을 유발. -->
- User Story: As a user, when I move two formerly recurring events to the same date, I want both to remain, ignoring time overlap.
<!-- 사용자 스토리: 사용자로서 단일화된 두 일정을 같은 날로 옮기면, 시간 겹침을 무시하고 두 일정 모두 남길 수 있어야 한다. -->

## 2. Input → Output (Concrete Examples)
<!-- 입력 → 출력 (구체 예시) -->
- Before:
<!-- 변경 전: -->
  1) Create daily repeating event for 5 days (Mon–Fri).
  <!-- 1) 매일 반복 일정 5개(월~금) 존재. -->
  2) Edit Monday instance → single only → move to next Monday.
  <!-- 2) 월요일 인스턴스 단일 편집 → 다음 주 월요일로 이동. -->
  3) Edit Tuesday instance → single only → move to next Tuesday.
  <!-- 3) 화요일 인스턴스 단일 편집 → 다음 주 화요일로 이동. -->
  4) Move both to the same Wednesday; after overlap confirm, one disappears.
  <!-- 4) 두 일정을 같은 수요일로 이동 후 겹침 확인 시 하나가 사라짐. -->
- After:
<!-- 변경 후: -->
  After overlap confirm, both events persist on the same date (times may overlap).
  <!-- 겹침 확인 후에도 두 일정 모두 동일 날짜에 유지(시간 겹침 허용). -->

## 3. Scope & Non-Goals
<!-- 범위 & 비범위 -->
- In Scope:
<!-- 범위 내: -->
  - Overlap handling when saving/moving events, especially for singleized instances from recurring series.
  <!-- 단일화된 반복 일정 인스턴스의 저장/이동 시 겹침 처리. -->
  - Ensuring non-destructive merges: never drop an event silently.
  <!-- 비파괴적 병합 보장: 일정이 무단 소실되지 않게. -->
- Out of Scope:
<!-- 범위 외: -->
  - Complex conflict resolution UI beyond existing overlap dialog.
  <!-- 기존 겹침 다이얼로그를 넘어서는 복잡한 UI 변경. -->
  - Changing notification/holiday logic.
  <!-- 알림/공휴일 로직 변경. -->

## 4. Requirements
<!-- 요구사항 -->
- Functional:
<!-- 기능 요구사항: -->
  - When two events end up on the same date, persist both entries.
  <!-- 동일 날짜로 이동 시 두 이벤트 모두 저장. -->
  - Time overlap is allowed and ignored for conflict purposes.
  <!-- 시간 겹침은 허용 및 무시. -->
  - Overlap dialog confirm should never delete/override an existing event unintentionally.
  <!-- 겹침 다이얼로그 확인 시 기존 일정이 의도치 않게 삭제/덮어쓰기되지 않음. -->
- Non-Functional:
<!-- 비기능 요구사항: -->
  - Backward compatible with current APIs (events, recurring-events endpoints via msw stubs).
  <!-- 현 API(msw 스텁)와 하위 호환. -->

## 5. Success Criteria
<!-- 성공 기준 -->
- Definition of Done:
<!-- 완료 정의: -->
  - Scenario test passes: two singleized events moved to the same date both exist in the list.
  <!-- 시나리오 테스트 통과: 동일 날짜에 두 단일화 일정이 공존. -->
  - No regression in base e2e (basic/recurring/overlap/search/notifications).
  <!-- 기존 e2e 회귀 없음. -->

## 6. Risks & Edge Cases
<!-- 리스크 & 엣지 케이스 -->
- Risks:
<!-- 리스크: -->
  - Server update semantics might replace entries by identical IDs.
  <!-- 서버 업데이트 시 ID 충돌로 덮어쓰기 위험. -->
- Edge Cases:
<!-- 엣지 케이스: -->
  - Same title/time/category; ensure uniqueness by ID and not collapse into one.
  <!-- 제목/시간/카테고리가 같아도 ID로 구분되어 하나로 합쳐지지 않게. -->

## 7. TDD Plan (High level)
<!-- TDD 계획 (상위 수준) -->
- Red cases:
<!-- 실패 테스트 목록: -->
  - Scenario test `overlapRecurringMoveScenario` initially fails if one event disappears.
  <!-- 시나리오 테스트가 하나가 사라지면 실패. -->
- Green implementation notes:
<!-- 구현 메모: -->
  - On save/move with overlap confirm, use append semantics; do not replace another event unless same id.
  <!-- 겹침 확인 저장 시 append(추가) 세만틱; 동일 id가 아니면 대체 금지. -->
  - On converting recurring to single (drag/edit), ensure `repeat: none` but keep original unique id.
  <!-- 단일화 시 repeat 해제하되 고유 id 유지. -->
- Refactor notes:
<!-- 리팩토링 메모: -->
  - Centralize overlap merge policy in one util to avoid divergence between drag/save flows.
  <!-- 겹침 병합 정책을 유틸로 일원화. -->

## 8. Review Checklist
<!-- 리뷰 체크리스트 -->
- [ ] Spec complete (Sections 1,2,5 clear)
<!-- [ ] 명세 충족 (섹션 1,2,5 명확) -->
- [ ] Interfaces clarified (TS types ready)
<!-- [ ] 인터페이스 명확 (TS 타입 준비) -->
- [ ] Testability verified
<!-- [ ] 테스트 가능성 확인 -->

## 9. Approval
<!-- 승인 -->
- Requester: King (건물주)
<!-- 요청자: 건물주 -->
- Approver: User
<!-- 승인자: 사용자 -->
- Date: 2025-11-04
<!-- 일자: 2025-11-04 -->


