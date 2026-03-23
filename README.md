# Nuvo

> Web2 사용자를 위한 토스 같은 Web3 송금 앱

구글 로그인 하나로 Web3 지갑을 만들고, 친구 닉네임으로 코인을 보내는 서비스

[Live Demo](배포후추가) · [GitHub](https://github.com/Melonisjy/nuvo)

<img width="445" height="1006" alt="image" src="https://github.com/user-attachments/assets/d32be574-f16e-4ae6-9682-05e589597520" />


---

## 기획 배경

기존 Web3 송금의 문제:

- 지갑 설치/개인키 관리가 복잡
- 0x... 주소를 직접 입력해야 함
- 가스비 개념을 모르면 사용 불가

**Nuvo는 이 3가지를 모두 없앴습니다.**

---

## 핵심 기능

- 구글 로그인만으로 Web3 지갑 자동 생성
- 닉네임(@melonisjy)으로 코인 송금
- Base 체인 기반 실시간 잔액 조회
- 토스 같은 단순한 UX

---

## 기술 스택 및 선택 이유

| 기술            | 선택 이유                                              |
| --------------- | ------------------------------------------------------ |
| Next.js 14      | Pages Router 기반, SSR/CSR 유연한 전환                 |
| TypeScript      | 지갑 주소/체인 단위 변환 실수 방지                     |
| Privy           | 소셜 로그인 → 지갑 자동 생성, Web2 온보딩              |
| viem            | TypeScript-first 설계, ethers.js 대비 타입 안정성 우세 |
| Base Chain      | 이더리움 L2, 가스비 거의 0, Web2 사용자 친화           |
| Supabase        | 닉네임 ↔ 지갑 주소 매핑 DB                             |
| Tailwind CSS v4 | 빠른 UI 구현                                           |

---

## 아키텍처 (추후 업데이트 예정)

```
app/
  page.tsx          # 시작/로그인 화면
  setup/            # 닉네임 설정
  dashboard/        # 홈 (잔액, 보내기)
  send/             # 송금 화면
components/         # UI 컴포넌트
hooks/              # 커스텀 훅 (잔액 조회, 송금 등)
lib/
  supabase.ts       # Supabase 클라이언트
  users.ts          # 유저 DB 함수
  viem.ts           # Base 체인 클라이언트
types/              # 타입 정의
```

---

## 트러블슈팅

### 1. createContext 서버 컴포넌트 에러

- **문제**: `layout.tsx`에 PrivyProvider 직접 사용 시 에러
- **원인**: App Router에서 layout은 서버 컴포넌트
- **해결**: `providers.tsx` 분리 후 `'use client'` 선언

### 2. Tailwind v4 설정 변경

- **문제**: `@tailwind base/components/utilities` 동작 안 함
- **원인**: v4에서 설정 방식 변경
- **해결**: `@import "tailwindcss"` 한 줄로 교체

### 3. 잔액 조회 메모리 누수 방지

- **문제**: 로그아웃 시 비동기 잔액 조회가 계속 실행됨
- **원인**: 컴포넌트 언마운트 후에도 setState 호출
- **해결**: cancelled 플래그 + useEffect 클린업 함수

---

## 로컬 실행

```bash
git clone https://github.com/Melonisjy/nuvo
cd nuvo
npm install
# .env.local 설정 (아래 참고)
npm run dev
```

### 환경변수

```
NEXT_PUBLIC_PRIVY_APP_ID=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## 개발 과정
