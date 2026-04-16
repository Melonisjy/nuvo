"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  formatEthValue,
  getCounterpartyLabel,
  getDateLabel,
  getInitial,
  useTransactions,
} from "@/hooks/useTransactions";

export default function HistoryPage() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();
  const walletAddress = user?.wallet?.address;
  const { displayItems, nicknameMap, isLoading, isError } =
    useTransactions(walletAddress);

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) router.replace("/");
  }, [ready, authenticated, router]);

  if (!ready || !authenticated) return null;

  return (
    <main className="flex min-h-screen justify-center bg-[#f5f5f5]">
      <div className="w-full max-w-[390px] px-5 pt-10 pb-24">
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-2xl leading-none text-[#111827]"
            aria-label="뒤로"
          >
            ‹
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">거래 내역</h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              최근 거래를 시간순으로 확인할 수 있어요
            </p>
          </div>
        </div>

        <section className="rounded-[16px] bg-white p-4 shadow-sm">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2, 3, 4].map((idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
                      <div className="h-2.5 w-16 rounded bg-gray-200 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="py-12 text-center text-[14px] text-[#9CA3AF]">
              거래 내역을 불러올 수 없습니다
            </div>
          ) : displayItems.length === 0 ? (
            <div className="py-12 text-center text-[14px] text-[#9CA3AF]">
              거래 내역이 없습니다
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {displayItems.map((tx) => {
                const counterpartyLabel = getCounterpartyLabel(tx, nicknameMap);
                const amount = `${tx.isOutgoing ? "- " : "+ "}${formatEthValue(tx.value)}`;
                const isShortenedAddressLabel = counterpartyLabel.startsWith("0x");

                return (
                  <div
                    key={`${tx.hash}-${tx.timestamp}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[12px] font-semibold text-[#111]">
                        {isShortenedAddressLabel ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#888"
                            strokeWidth="2"
                          >
                            <path d="M20 12V22H4V12" />
                            <path d="M22 7H2v5h20V7z" />
                            <path d="M12 22V7" />
                            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                          </svg>
                        ) : (
                          getInitial(counterpartyLabel)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] text-[#111827]">
                          {counterpartyLabel}
                        </p>
                        <p className="text-[12px] text-[#9CA3AF]">
                          {getDateLabel(tx.timestamp)}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-[13px] font-bold ${tx.isOutgoing ? "text-[#E24B4A]" : "text-[#1D9E75]"}`}
                    >
                      {amount}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
