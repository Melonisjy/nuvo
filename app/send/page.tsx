"use client";

import { usePrivy, useSendTransaction } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { baseSepolia } from "viem/chains";
import {
  createPublicClient,
  formatEther,
  getAddress,
  http,
  parseEther,
} from "viem";
import { getUserByNickname } from "@/lib/users";

const baseClient = createPublicClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

type Step = 1 | 2 | 3;

type RecipientRow = {
  nickname: string;
  wallet_address: string | null;
  privy_id: string;
};

export default function SendPage() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();
  const { sendTransaction } = useSendTransaction();

  const [step, setStep] = useState<Step>(1);
  const [nickname, setNickname] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [recipient, setRecipient] = useState<RecipientRow | null>(null);
  const [balanceWei, setBalanceWei] = useState<bigint | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [isSendLoading, setIsSendLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) router.replace("/");
  }, [ready, authenticated, router]);

  const fetchBalance = useCallback(async () => {
    const address = user?.wallet?.address;
    if (!address) return;
    try {
      setIsBalanceLoading(true);
      const checksumAddress = getAddress(address);
      const wei = await baseClient.getBalance({ address: checksumAddress });
      setBalanceWei(wei);
    } catch {
      setBalanceWei(null);
    } finally {
      setIsBalanceLoading(false);
    }
  }, [user?.wallet?.address]);

  useEffect(() => {
    if (!ready || !authenticated || !user?.wallet?.address) return;
    void fetchBalance();
  }, [ready, authenticated, user?.wallet?.address, fetchBalance]);

  const goBack = () => {
    setError("");
    if (step === 1) {
      router.push("/dashboard");
      return;
    }
    if (step === 2) {
      setStep(1);
      setAmountInput("");
      return;
    }
    setStep(2);
  };

  const handleStep1Next = async () => {
    const n = nickname.trim();
    if (n.length < 2) {
      setError("닉네임을 입력해주세요");
      return;
    }
    setIsLookupLoading(true);
    setError("");
    try {
      const row = await getUserByNickname(n);
      if (!row) {
        setError("존재하지 않는 닉네임이에요");
        return;
      }
      const r = row as RecipientRow;
      if (r.privy_id === user?.id) {
        setError("본인에게는 보낼 수 없어요");
        return;
      }
      if (!r.wallet_address?.trim()) {
        setError("상대방 지갑 정보를 찾을 수 없어요");
        return;
      }
      setRecipient(r);
      setStep(2);
    } catch {
      setError("조회 중 오류가 났어요. 다시 시도해주세요");
    } finally {
      setIsLookupLoading(false);
    }
  };

  const handleStep2Next = () => {
    setError("");
    const raw = amountInput.trim();
    if (!raw) {
      setError("금액을 입력해주세요");
      return;
    }
    let wei: bigint;
    try {
      wei = parseEther(raw);
    } catch {
      setError("올바른 금액을 입력해주세요");
      return;
    }
    if (wei <= BigInt(0)) {
      setError("0보다 큰 금액을 입력해주세요");
      return;
    }
    if (balanceWei === null) {
      setError("잔액을 불러오지 못했어요. 잠시 후 다시 시도해주세요");
      return;
    }
    if (wei > balanceWei) {
      setError("잔액이 부족해요");
      return;
    }
    setStep(3);
  };

  const handleSend = async () => {
    if (!recipient?.wallet_address || !amountInput.trim()) return;
    setIsSendLoading(true);
    setError("");
    try {
      const to = getAddress(recipient.wallet_address);
      const value = parseEther(amountInput.trim());
      await sendTransaction(
        {
          to,
          value,
          chainId: baseSepolia.id,
        },
        { sponsor: false },
      );
      router.replace("/dashboard");
    } catch (e) {
      const msg =
        e instanceof Error && e.message
          ? e.message
          : "송금에 실패했어요. 다시 시도해주세요";
      setError(msg);
    } finally {
      setIsSendLoading(false);
    }
  };

  const displayAmount = (() => {
    const raw = amountInput.trim();
    if (!raw) return "0";
    try {
      return formatEther(parseEther(raw));
    } catch {
      return raw;
    }
  })();

  if (!ready || !authenticated) return null;

  return (
    <main className="flex justify-center bg-white min-h-screen">
      <div className="w-full max-w-[390px] min-h-screen flex flex-col px-5 pt-6 pb-24">
        {/* 상단 뒤로가기 */}
        <div className="flex items-center gap-1 -ml-1 mb-6">
          <button
            type="button"
            onClick={goBack}
            className="p-2 -m-2 text-[#111827] active:opacity-60"
            aria-label="뒤로"
          >
            <span className="text-2xl leading-none">‹</span>
          </button>
        </div>

        {step === 1 && (
          <>
            <div className="mb-8">
              <p className="text-[#3182F6] text-sm font-semibold mb-3">
                보내기
              </p>
              <h1 className="text-2xl font-bold text-[#111827] leading-snug">
                누구에게
                <br />
                보낼까요?
              </h1>
              <p className="text-[#6B7280] text-sm mt-2">
                받는 사람의 닉네임을 입력해주세요
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
                {nickname ? (
                  <span className="text-xs text-[#6B7280]">
                    {nickname.length}/20
                  </span>
                ) : null}
              </div>
              {error ? (
                <p className="text-red-400 text-xs px-1">{error}</p>
              ) : (
                <p className="text-[#9CA3AF] text-xs px-1">
                  영문 소문자, 숫자, _만 사용 가능
                </p>
              )}
            </div>

            <div className="fixed bottom-[64px] left-0 right-0 z-10 px-5">
              <div className="max-w-[390px] mx-auto">
                <button
                  type="button"
                  onClick={handleStep1Next}
                  disabled={
                    nickname.trim().length < 2 || isLookupLoading
                  }
                  className="w-full bg-[#3182F6] text-white py-4 rounded-2xl text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                >
                  {isLookupLoading ? "확인 중..." : "다음"}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 2 && recipient && (
          <>
            <div className="mb-8">
              <p className="text-[#3182F6] text-sm font-semibold mb-3">
                금액
              </p>
              <h1 className="text-2xl font-bold text-[#111827] leading-snug">
                @{recipient.nickname}님에게
                <br />
                얼마를 보낼까요?
              </h1>
              <p className="text-[#6B7280] text-sm mt-2">
                {isBalanceLoading
                  ? "잔액 불러오는 중..."
                  : balanceWei !== null
                    ? `보낼 수 있는 금액: ${formatEther(balanceWei)} ETH`
                    : "잔액을 확인할 수 없어요"}
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
                <input
                  type="text"
                  inputMode="decimal"
                  value={amountInput}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.]/g, "");
                    const parts = v.split(".");
                    const next =
                      parts.length > 2
                        ? `${parts[0]}.${parts.slice(1).join("")}`
                        : v;
                    setAmountInput(next);
                    setError("");
                  }}
                  placeholder="0"
                  className="bg-transparent flex-1 outline-none text-[#111827] placeholder-[#D1D5DB] text-2xl font-bold"
                  autoFocus
                />
                <span className="text-[#6B7280] font-semibold">ETH</span>
              </div>
              {error ? (
                <p className="text-red-400 text-xs px-1">{error}</p>
              ) : null}
            </div>

            <div className="fixed bottom-[64px] left-0 right-0 z-10 px-5">
              <div className="max-w-[390px] mx-auto">
                <button
                  type="button"
                  onClick={handleStep2Next}
                  disabled={!amountInput.trim() || isBalanceLoading}
                  className="w-full bg-[#3182F6] text-white py-4 rounded-2xl text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                >
                  확인
                </button>
              </div>
            </div>
          </>
        )}

        {step === 3 && recipient && (
          <>
            <div className="mb-8">
              <p className="text-[#3182F6] text-sm font-semibold mb-3">
                확인
              </p>
              <h1 className="text-2xl font-bold text-[#111827] leading-snug">
                @{recipient.nickname}에게
                <br />
                <span className="text-[#3182F6]">{displayAmount} ETH</span>
                를
                <br />
                보낼까요?
              </h1>
            </div>

            {error ? (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            ) : null}

            <div className="fixed bottom-[64px] left-0 right-0 z-10 px-5">
              <div className="max-w-[390px] mx-auto flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep(2);
                  }}
                  disabled={isSendLoading}
                  className="flex-1 bg-[#F3F4F6] text-[#111827] py-4 rounded-2xl text-base font-semibold active:scale-95 transition-transform disabled:opacity-40"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSendLoading}
                  className="flex-1 bg-[#3182F6] text-white py-4 rounded-2xl text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                >
                  {isSendLoading ? "보내는 중..." : "보내기"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
