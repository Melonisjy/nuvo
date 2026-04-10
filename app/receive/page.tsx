"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ReceivePage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) router.replace("/");
  }, [ready, authenticated, router]);

  if (!ready || !authenticated) return null;

  return (
    <main className="flex min-h-screen justify-center bg-white">
      <div className="w-full max-w-[390px] px-5 pt-10 pb-24">
        <h1 className="text-2xl font-bold text-[#111827]">받기</h1>
        <p className="mt-3 text-sm text-[#6B7280]">
          받기 페이지는 다음 단계에서 구현될 예정입니다.
        </p>
      </div>
    </main>
  );
}
