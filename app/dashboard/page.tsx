"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  formatEthValue,
  getCounterpartyLabel,
  getDateLabel,
  getInitial,
  useTransactions,
} from "@/hooks/useTransactions";
import { baseSepolia } from "viem/chains";
import {
  createPublicClient,
  formatEther,
  getAddress,
  http,
  parseEther,
} from "viem";

const baseClient = createPublicClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

const MIN_DISPLAY_WEI = parseEther("0.0001");

function formatEth4(value: bigint): string {
  if (value === BigInt(0)) return "0.0000";
  if (value < MIN_DISPLAY_WEI) return "< 0.0001";
  const raw = formatEther(value);
  const [intPart, decPart = ""] = raw.split(".");
  return `${intPart}.${decPart.padEnd(4, "0").slice(0, 4)}`;
}

export default function Dashboard() {
  const { authenticated, ready, user } = usePrivy();
  const router = useRouter();
  const [balanceEth, setBalanceEth] = useState<string | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const walletAddress = user?.wallet?.address;
  const { displayItems, nicknameMap, isLoading, isError } =
    useTransactions(walletAddress);

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

  const safeWalletAddress = walletAddress ?? "";
  const shortenedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "지갑 생성 중...";
  const recentTransactions = displayItems.slice(0, 3);

  const actionButtonClass =
    "bg-[#f5f5f5] rounded-[8px] px-4 py-2 text-[14px] font-semibold text-[#111827]";

  return (
    <main className="flex justify-center bg-[#f5f5f5] min-h-screen">
      <div className="w-full max-w-[390px] min-h-screen flex flex-col bg-[#f5f5f5] pb-24">
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center px-5 pt-14 pb-4">
          <h1 className="text-xl font-bold text-[#111827]">Nuvo</h1>

          <button
            type="button"
            className="w-8 h-8 rounded-full bg-transparent shadow-none flex items-center justify-center"
            aria-label="알림"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 17H9"
                stroke="#111827"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M18.5 17C18.5 15.8954 18.5 15.3431 18.322 14.8765C18.1439 14.4098 17.8049 14.0208 17.1269 13.2427C16.4488 12.4647 16.1098 12.0756 15.9318 11.609C15.7538 11.1423 15.7538 10.5901 15.7538 9.48549V8.5C15.7538 6.29086 14.0069 4.5 11.5 4.5C8.99306 4.5 7.24619 6.29086 7.24619 8.5V9.48549C7.24619 10.5901 7.24619 11.1423 7.06819 11.609C6.89019 12.0756 6.55118 12.4647 5.87316 13.2427C5.19514 14.0208 4.85613 14.4098 4.67813 14.8765C4.50013 15.3431 4.50013 15.8954 4.50013 17"
                stroke="#111827"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 인사말 */}
        <div className="px-5 mb-2">
          <p className="text-[#6B7280] text-sm">안녕하세요</p>
          <h2 className="text-2xl font-bold text-[#111827] mt-0.5">
            {/* {user?.google?.name}님 */}멜론님
          </h2>
        </div>

        {/* 잔액 카드 */}
        <section className="m-[12px] rounded-[16px] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#111827]">내 지갑</h3>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#E6F1FB] flex items-center justify-center">
                <span className="text-[#378ADD] font-bold text-[11px]">
                  ETH
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-[#aaa] font-medium">
                  Base Sepolia ETH
                </span>
                <span className="text-2xl font-bold text-[#111]">
                  {isBalanceLoading
                    ? "불러오는 중..."
                    : `${balanceEth ?? "0.0000"} ETH`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/send")}
              className={actionButtonClass}
            >
              보내기
            </button>
          </div>

          <div className="mt-4 h-px bg-black/10" />

          {/* 주소 */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-[12px] text-[#111827] font-mono truncate">
              {shortenedAddress}
            </p>

            <button
              type="button"
              onClick={async () => {
                if (!walletAddress) return;
                try {
                  await navigator.clipboard.writeText(safeWalletAddress);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1200);
                } catch {
                  // clipboard 접근 실패 시 조용히 종료 (UX는 추후 개선 가능)
                }
              }}
              className={actionButtonClass}
            >
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
        </section>

        {/* 트랜잭션 히스토리 카드 */}
        <section className="m-[12px] min-h-[170px] rounded-[16px] bg-white p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#111827]">최근 거래</h3>
          </div>

          <div className="mt-4 flex-1">
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
                        <div className="h-2.5 w-14 rounded bg-gray-200 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-[14px] text-[#aaa]">
                  거래 내역을 불러올 수 없습니다
                </p>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-[14px] text-[#aaa]">
                  거래 내역이 없습니다
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {recentTransactions.map((tx) => {
                    const counterpartyLabel = getCounterpartyLabel(
                      tx,
                      nicknameMap,
                    );
                    const amount = `${tx.isOutgoing ? "- " : "+ "}${formatEthValue(tx.value)}`;
                    const isShortenedAddressLabel =
                      counterpartyLabel.startsWith("0x");
                    return (
                      <div
                        key={`${tx.hash}-${tx.timestamp}`}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[12px] font-semibold text-[#111]">
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
                            <p className="text-[13px] text-[#111] truncate">
                              {counterpartyLabel}
                            </p>
                            <p className="text-[11px] text-[#bbb]">
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
                {displayItems.length >= 3 ? (
                  <div className="mt-4 border-t border-black/10 pt-3 text-center">
                    <button
                      type="button"
                      onClick={() => router.push("/history")}
                      className="text-[13px] font-semibold text-[#6B7280]"
                    >
                      전체 보기
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
