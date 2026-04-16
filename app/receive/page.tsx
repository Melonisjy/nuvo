"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserByPrivyId } from "@/lib/users";

export default function ReceivePage() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();
  const [myNickname, setMyNickname] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) router.replace("/");
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (!ready || !authenticated || !user?.id) return;

    let cancelled = false;
    const fetchNickname = async () => {
      const row = await getUserByPrivyId(user.id);
      if (cancelled) return;
      setMyNickname(row?.nickname?.trim() ?? "");
    };

    void fetchNickname();
    return () => {
      cancelled = true;
    };
  }, [ready, authenticated, user?.id]);

  useEffect(() => {
    if (!toastMessage) return;
    const timerId = window.setTimeout(() => {
      setToastMessage("");
    }, 1600);
    return () => {
      window.clearTimeout(timerId);
    };
  }, [toastMessage]);

  if (!ready || !authenticated) return null;

  const walletAddress = user?.wallet?.address ?? "";
  const shortenedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "지갑 생성 중...";
  const shareLink = myNickname
    ? `${window.location.origin}/send/${encodeURIComponent(myNickname)}`
    : "";

  const copyText = async (value: string, successMessage: string) => {
    if (!value) {
      setToastMessage("복사할 정보를 찾을 수 없습니다");
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setToastMessage(successMessage);
    } catch {
      setToastMessage("복사에 실패했습니다");
    }
  };

  return (
    <main className="flex min-h-screen justify-center bg-[#f5f5f5]">
      <div className="w-full max-w-[390px] px-5 pt-10 pb-24">
        {toastMessage ? (
          <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-[10px] bg-[#111827] px-3 py-2 text-[13px] text-white">
            {toastMessage}
          </div>
        ) : null}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">받기</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            주소 대신 링크나 지갑 주소를 복사해서 공유할 수 있어요
          </p>
        </div>

        <section className="rounded-[16px] bg-white p-5 shadow-sm">
          <p className="text-[13px] font-semibold text-[#3182F6]">내 송금 링크</p>
          <p className="mt-2 break-all text-[14px] text-[#111827]">
            {myNickname ? shareLink : "닉네임 정보를 불러오는 중..."}
          </p>
          <button
            type="button"
            onClick={() => void copyText(shareLink, "링크가 복사됐습니다")}
            className="mt-4 w-full rounded-[12px] bg-[#3182F6] px-4 py-3 text-[15px] font-semibold text-white"
          >
            링크 복사
          </button>
        </section>

        <section className="mt-4 rounded-[16px] bg-white p-5 shadow-sm">
          <p className="text-[13px] font-semibold text-[#3182F6]">내 지갑 주소</p>
          <p className="mt-2 break-all font-mono text-[14px] text-[#111827]">
            {walletAddress || "지갑 생성 중..."}
          </p>
          <div className="mt-4 flex items-center justify-between rounded-[12px] bg-[#f5f5f5] px-4 py-3">
            <span className="text-[13px] text-[#6B7280]">{shortenedAddress}</span>
            <button
              type="button"
              onClick={() => void copyText(walletAddress, "주소가 복사됐습니다")}
              className="text-[14px] font-semibold text-[#111827]"
            >
              복사
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
