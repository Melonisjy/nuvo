'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, router]);

  if (!ready) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold text-gray-900">Nuvo</h1>
          <p className="text-gray-400 text-sm">새로운 Web3 경험</p>
        </div>
        <button
          onClick={login}
          className="bg-[#3182F6] text-white px-10 py-4 rounded-2xl text-lg font-medium w-72"
        >
          시작하기
        </button>
      </div>
    </main>
  );
}