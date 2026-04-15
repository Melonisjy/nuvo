"use client";

import { usePrivy, useSendTransaction } from "@privy-io/react-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAddress, parseEther } from "viem";
import { baseSepolia } from "viem/chains";
import { getUserByNickname } from "@/lib/users";

type RecipientRow = {
  nickname: string;
  wallet_address: string | null;
  privy_id: string;
};

function shortenAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function PublicSendPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { login, authenticated, ready, user } = usePrivy();
  const { sendTransaction } = useSendTransaction();

  const nickname = useMemo(() => {
    const segment = pathname.split("/").filter(Boolean).pop() ?? "";
    return decodeURIComponent(segment).toLowerCase();
  }, [pathname]);

  const [recipient, setRecipient] = useState<RecipientRow | null>(null);
  const [isLookupLoading, setIsLookupLoading] = useState(true);
  const [amountInput, setAmountInput] = useState("");
  const [isSendLoading, setIsSendLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const lookup = async () => {
      try {
        setIsLookupLoading(true);
        setError("");
        const row = await getUserByNickname(nickname);
        if (cancelled) return;
        if (!row || !row.wallet_address?.trim()) {
          setRecipient(null);
          return;
        }
        setRecipient(row as RecipientRow);
      } catch {
        if (!cancelled) {
          setRecipient(null);
          setError("사용자 정보를 불러오지 못했습니다");
        }
      } finally {
        if (!cancelled) setIsLookupLoading(false);
      }
    };

    if (!nickname) {
      setRecipient(null);
      setIsLookupLoading(false);
      return;
    }

    void lookup();
    return () => {
      cancelled = true;
    };
  }, [nickname]);

  const handleSend = async () => {
    if (!recipient?.wallet_address) return;
    setError("");

    const raw = amountInput.trim();
    if (!raw) {
      setError("금액을 입력해주세요");
      return;
    }

    let value: bigint;
    try {
      value = parseEther(raw);
    } catch {
      setError("올바른 금액을 입력해주세요");
      return;
    }

    if (value <= BigInt(0)) {
      setError("0보다 큰 금액을 입력해주세요");
      return;
    }

    if (!ready || !authenticated) {
      login();
      return;
    }

    const senderAddress = user?.wallet?.address?.toLowerCase();
    const receiverAddress = recipient.wallet_address.toLowerCase();
    const isSelfByPrivyId = recipient.privy_id === user?.id;
    const isSelfByWallet = !!senderAddress && senderAddress === receiverAddress;
    if (isSelfByPrivyId || isSelfByWallet) {
      setError("본인에게는 송금할 수 없습니다");
      return;
    }

    try {
      setIsSendLoading(true);
      await sendTransaction(
        {
          to: getAddress(recipient.wallet_address),
          value,
          chainId: baseSepolia.id,
        },
        { sponsor: false },
      );
      setIsSuccess(true);
    } catch (e) {
      const msg =
        e instanceof Error && e.message
          ? e.message
          : "송금에 실패했습니다. 다시 시도해주세요";
      setError(msg);
    } finally {
      setIsSendLoading(false);
    }
  };

  return (
    <main className="flex justify-center bg-white min-h-screen">
      <div className="w-full max-w-[390px] min-h-screen px-5 pt-8 pb-28">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 text-[#111827] text-sm"
        >
          ← 뒤로
        </button>

        {isLookupLoading ? (
          <p className="text-sm text-[#6B7280]">수신자 정보를 불러오는 중...</p>
        ) : !recipient ? (
          <p className="text-sm text-[#111827]">존재하지 않는 사용자입니다</p>
        ) : isSuccess ? (
          <div className="rounded-2xl bg-[#F0F9FF] p-4">
            <p className="text-[16px] font-semibold text-[#111827]">
              송금이 완료됐습니다
            </p>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              @{recipient.nickname}님에게 전송이 완료되었습니다.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#111827]">
                {recipient.nickname}님에게 보내기
              </h1>
              <p className="mt-2 text-[13px] text-[#6B7280]">
                {shortenAddress(recipient.wallet_address ?? "")}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4">
              <input
                type="text"
                inputMode="decimal"
                value={amountInput}
                onChange={(e) => {
                  const only = e.target.value.replace(/[^0-9.]/g, "");
                  const parts = only.split(".");
                  const normalized =
                    parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : only;
                  setAmountInput(normalized);
                  setError("");
                }}
                placeholder="0.00"
                className="w-full bg-transparent text-2xl font-bold text-[#111827] outline-none placeholder-[#D1D5DB]"
              />
              <p className="mt-1 text-xs text-[#9CA3AF]">ETH</p>
            </div>

            {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

            <div className="fixed bottom-0 left-0 right-0 px-5 pb-6">
              <div className="mx-auto w-full max-w-[390px]">
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={
                    isLookupLoading ||
                    !recipient ||
                    !amountInput.trim() ||
                    isSendLoading
                  }
                  className="w-full rounded-2xl bg-[#3182F6] py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSendLoading ? "전송 중..." : "보내기"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
