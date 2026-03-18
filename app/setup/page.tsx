"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createUser, getUserByNickname, getUserByPrivyId } from "@/lib/users";

export default function Setup() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      router.replace("/");
      return;
    }
    // 이미 닉네임 있으면 dashboard로
    const check = async () => {
      const existing = await getUserByPrivyId(user!.id);
      if (existing) router.replace("/dashboard");
    };
    check();
  }, [ready, authenticated, user, router]);

  const handleSubmit = async () => {
    if (!nickname.trim()) return;
    if (nickname.length < 2) {
      setError("닉네임은 2자 이상이어야 해요");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 닉네임 중복 확인
      const existing = await getUserByNickname(nickname);
      if (existing) {
        setError("이미 사용 중인 닉네임이에요");
        return;
      }

      // 유저 생성
      await createUser({
        privyId: user!.id,
        nickname,
        walletAddress: user!.wallet?.address ?? "",
        email: user?.google?.email,
      });

      router.replace("/dashboard");
    } catch (e) {
      setError("오류가 발생했어요. 다시 시도해주세요");
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready || !authenticated) return null;

  return (
    <main className="flex justify-center bg-white min-h-screen">
      <div className="w-full max-w-[390px] min-h-screen flex flex-col px-6 pt-20">
        {/* 타이틀 */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            닉네임을 설정해요
          </h1>
          <p className="text-gray-400 text-sm">
            친구들이 이 닉네임으로 나에게 송금할 수 있어요
          </p>
        </div>

        {/* 입력 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center bg-gray-50 rounded-2xl px-4 py-4 gap-2">
            <span className="text-gray-400 font-medium">@</span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(
                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                );
                setError("");
              }}
              placeholder="닉네임 입력"
              className="bg-transparent flex-1 outline-none text-gray-900 placeholder-gray-300"
              maxLength={20}
            />
          </div>
          {error && <p className="text-red-400 text-xs px-1">{error}</p>}
          <p className="text-gray-300 text-xs px-1">
            영문 소문자, 숫자, 언더스코어(_)만 사용 가능
          </p>
        </div>

        {/* 버튼 */}
        <div className="fixed bottom-8 left-0 right-0 px-6 max-w-[390px] mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!nickname.trim() || isLoading}
            className="w-full bg-[#3182F6] text-white py-4 rounded-2xl text-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "설정 중..." : "시작하기"}
          </button>
        </div>
      </div>
    </main>
  );
}
