"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getUserByPrivyId } from "@/lib/users";

export default function Home() {
  const { login, authenticated, ready, user } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (!ready || !authenticated) return;

    const redirect = async () => {
      const existing = await getUserByPrivyId(user!.id);
      if (existing) {
        router.push("/dashboard");
      } else {
        router.push("/setup");
      }
    };

    redirect();
  }, [ready, authenticated, user, router]);

  if (!ready) return null;

  return (
    <main className="flex justify-center bg-white min-h-screen">
      <div className="w-full max-w-[390px] min-h-screen flex flex-col items-center justify-center gap-8 px-6">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
            Nuvo
          </h1>
          <p className="text-gray-400 text-sm">새로운 Web3 경험</p>
        </div>
        <button
          onClick={login}
          className="w-full bg-[#3182F6] text-white py-4 rounded-2xl text-lg font-medium"
        >
          시작하기
        </button>
      </div>
    </main>
  );
}
