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
    const check = async () => {
      const existing = await getUserByPrivyId(user!.id);
      if (existing) router.replace("/dashboard");
    };
    check();
  }, [ready, authenticated, user, router]);

  const handleSubmit = async () => {
    if (!nickname.trim() || nickname.length < 2) {
      setError("닉네임은 2자 이상이어야 해요");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const existing = await getUserByNickname(nickname);
      if (existing) {
        setError("이미 사용 중인 닉네임이에요");
        return;
      }
      await createUser({
        privyId: user!.id,
        nickname,
        walletAddress: user!.wallet?.address ?? "",
        email: user?.google?.email,
      });
      router.replace("/dashboard");
    } catch {
      setError("오류가 발생했어요. 다시 시도해주세요");
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready || !authenticated) return null;

  return (
    <main className="flex justify-center bg-white min-h-screen">
      <div className="w-full max-w-[390px] min-h-screen flex flex-col px-5 pt-16">
        <div className="mb-10">
          <p className="text-[#3182F6] text-sm font-semibold mb-3">시작하기</p>
          <h1 className="text-2xl font-bold text-[#111827] leading-snug">
            어떤 닉네임을
            <br />
            사용할까요?
          </h1>
          <p className="text-[#6B7280] text-sm mt-2">
            친구들이 이 닉네임으로 송금할 수 있어요
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div
            className={`flex items-center bg-[#F9FAFB] rounded-2xl px-4 py-4 gap-2 border transition-colors ${
              error
                ? "border-red-400"
                : "border-transparent focus-within:border-[#3182F6]"
            }`}
          >
            <span className="text-[#3182F6] font-bold text-lg">@</span>
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
              className="bg-transparent flex-1 outline-none text-[#111827] placeholder-[#D1D5DB] text-lg"
              maxLength={20}
              autoFocus
            />
            {nickname && (
              <span className="text-xs text-[#6B7280]">
                {nickname.length}/20
              </span>
            )}
          </div>

          {error ? (
            <p className="text-red-400 text-xs px-1">{error}</p>
          ) : (
            <p className="text-[#9CA3AF] text-xs px-1">
              영문 소문자, 숫자, _만 사용 가능
            </p>
          )}
        </div>

        <div className="fixed bottom-8 left-0 right-0 px-5">
          <div className="max-w-[390px] mx-auto">
            <button
              onClick={handleSubmit}
              disabled={!nickname.trim() || nickname.length < 2 || isLoading}
              className="w-full bg-[#3182F6] text-white py-4 rounded-2xl text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
            >
              {isLoading ? "설정 중..." : "완료"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
