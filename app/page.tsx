'use client';
import { usePrivy } from '@privy-io/react-auth';

export default function Home() {
  const { login, logout, authenticated, user } = usePrivy();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      {authenticated ? (
        <>
          <p>안녕하세요, {user?.google?.name}</p>
          <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre>
          <button
            onClick={logout}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl"
          >
            로그아웃
          </button>
        </>
      ) : (
        <button
          onClick={login}
          className="bg-[#3182F6] text-white px-8 py-4 rounded-2xl text-lg font-medium"
        >
          시작하기
        </button>
      )}
    </main>
  );
}