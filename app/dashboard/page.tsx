"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { baseSepolia } from "viem/chains";
import { createPublicClient, formatEther, getAddress, http } from "viem";

const baseClient = createPublicClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

function formatEth4(value: bigint): string {
  const raw = formatEther(value);
  const [intPart, decPart = ""] = raw.split(".");
  return `${intPart}.${decPart.padEnd(4, "0").slice(0, 4)}`;
}

export default function Dashboard() {
  const { authenticated, ready, logout, user } = usePrivy();
  const router = useRouter();
  const [balanceEth, setBalanceEth] = useState<string | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) router.replace("/");
  }, [ready, authenticated, router]);

  useEffect(() => {
    const address = user?.wallet?.address;
    if (!ready || !authenticated || !address) return;

    let cancelled = false;
    const fetchBalance = async () => {
      try {
        setIsBalanceLoading(true);
        const checksumAddress = getAddress(address);
        const wei = await baseClient.getBalance({ address: checksumAddress });
        if (!cancelled) setBalanceEth(formatEth4(wei));
      } catch {
        if (!cancelled) setBalanceEth(null);
      } finally {
        if (!cancelled) setIsBalanceLoading(false);
      }
    };

    void fetchBalance();
    return () => {
      cancelled = true;
    };
  }, [ready, authenticated, user?.wallet?.address]);

  if (!ready || !authenticated) return null;

  return (
    <main className="flex justify-center bg-[#F2F4F6] min-h-screen">
      <div className="w-full max-w-[390px] min-h-screen flex flex-col">
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center px-5 pt-14 pb-4">
          <h1 className="text-xl font-bold text-[#111827]">Nuvo</h1>
          <button
            onClick={logout}
            className="text-[#6B7280] text-sm font-medium"
          >
            로그아웃
          </button>
        </div>

        {/* 인사말 */}
        <div className="px-5 mb-4">
          <p className="text-[#6B7280] text-sm">안녕하세요</p>
          <h2 className="text-2xl font-bold text-[#111827] mt-0.5">
            {user?.google?.name}님
          </h2>
        </div>

        {/* 잔액 카드 */}
        <div className="mx-4 bg-[#3182F6] rounded-3xl p-6 text-white shadow-lg">
          <p className="text-sm font-medium opacity-80 mb-4">
            Base Sepolia ETH 잔액
          </p>
          <p className="text-4xl font-bold tracking-tight">
            {isBalanceLoading
              ? "불러오는 중..."
              : `${balanceEth ?? "0.0000"} ETH`}
          </p>
          <p className="text-sm opacity-60 mt-2">Base Sepolia (테스트넷)</p>
        </div>

        {/* 액션 버튼 */}
        <div className="px-4 mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/send")}
            className="bg-white rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-[#EFF6FF] rounded-full flex items-center justify-center">
              <span className="text-[#3182F6] text-lg">↗</span>
            </div>
            <span className="text-sm font-semibold text-[#111827]">보내기</span>
          </button>
          <button className="bg-white rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-transform">
            <div className="w-10 h-10 bg-[#EFF6FF] rounded-full flex items-center justify-center">
              <span className="text-[#3182F6] text-lg">↙</span>
            </div>
            <span className="text-sm font-semibold text-[#111827]">받기</span>
          </button>
        </div>

        {/* 지갑 주소 카드 */}
        <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-medium text-[#6B7280] mb-1.5">
            내 지갑 주소
          </p>
          <p className="text-xs text-[#111827] font-mono truncate">
            {user?.wallet?.address ?? "지갑 생성 중..."}
          </p>
        </div>
      </div>
    </main>
  );
}
