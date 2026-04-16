# Nuvo

> Web2 사용자를 위한 토스 같은 Web3 송금 앱

구글 로그인 하나로 Web3 지갑을 만들고, 친구 닉네임으로 코인을 보내는 서비스

[Live Demo](https://nuvo-pi.vercel.app/) · [GitHub](https://github.com/Melonisjy/nuvo)

<img width="30%" alt="image" src="https://github.com/user-attachments/assets/d32be574-f16e-4ae6-9682-05e589597520" />


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
[[NUVO] 토스 같은 Web3 앱을 만들고 싶었다 (1)](https://velog.io/@meloncoder/%ED%86%A0%EC%8A%A4-%EA%B0%99%EC%9D%80-Web3-%EC%95%B1%EC%9D%84-%EB%A7%8C%EB%93%A4%EA%B3%A0-%EC%8B%B6%EC%97%88%EB%8B%A4)

[[NUVO] 닉네임으로 송금하기 (feat. sepolia testnet) (2)](https://velog.io/@meloncoder/Nuvo%EC%97%90%EC%84%9C-%EB%8B%89%EB%84%A4%EC%9E%84%EC%9C%BC%EB%A1%9C-%EC%86%A1%EA%B8%88%ED%95%98%EA%B8%B0-feat.-sepolia-testnet)

[[NUVO] 대시보드를 토스처럼 만들기 (feat. Basescan API) (3)](https://velog.io/@meloncoder/Nuvo-%EB%8C%80%EC%8B%9C%EB%B3%B4%EB%93%9C%EB%A5%BC-%ED%86%A0%EC%8A%A4%EC%B2%98%EB%9F%BC-%EB%A7%8C%EB%93%A4%EA%B8%B0-feat.-Basescan-API-3)

[[NUVO] 깨지는 라우트를 없애다 — receive, history, 탭바 정리 (4)](https://velog.io/@meloncoder/NUVO-%EA%B9%A8%EC%A7%80%EB%8A%94-%EB%9D%BC%EC%9A%B0%ED%8A%B8%EB%A5%BC-%EC%97%86%EC%95%A0%EB%8B%A4-receive-history-%ED%83%AD%EB%B0%94-%EC%A0%95%EB%A6%AC-4)
