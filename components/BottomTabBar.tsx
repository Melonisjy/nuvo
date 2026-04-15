"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserByPrivyId } from "@/lib/users";

type TabItem = {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
};

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 10.5L12 4L20 10.5V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V10.5Z"
        stroke={active ? "#111111" : "#bbbbbb"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 20V14.5C9.5 13.9477 9.94772 13.5 10.5 13.5H13.5C14.0523 13.5 14.5 13.9477 14.5 14.5V20"
        stroke={active ? "#111111" : "#bbbbbb"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 19V5"
        stroke={active ? "#111111" : "#bbbbbb"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 10.5L12 5L17.5 10.5"
        stroke={active ? "#111111" : "#bbbbbb"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReceiveIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 5V19"
        stroke={active ? "#111111" : "#bbbbbb"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 13.5L12 19L17.5 13.5"
        stroke={active ? "#111111" : "#bbbbbb"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const tabs: TabItem[] = [
  {
    label: "홈",
    href: "/dashboard",
    icon: (active) => <HomeIcon active={active} />,
  },
  {
    label: "보내기",
    href: "/send",
    icon: (active) => <SendIcon active={active} />,
  },
  {
    label: "받기",
    href: "/receive",
    icon: (active) => <ReceiveIcon active={active} />,
  },
];

export default function BottomTabBar() {
  const { authenticated, user } = usePrivy();
  const pathname = usePathname();
  const [nickname, setNickname] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (!authenticated || !user?.id) return;

    let cancelled = false;
    const fetchNickname = async () => {
      const row = await getUserByPrivyId(user.id);
      if (cancelled) return;
      setNickname(row?.nickname?.trim() ?? "");
    };

    void fetchNickname();
    return () => {
      cancelled = true;
    };
  }, [authenticated, user?.id]);

  useEffect(() => {
    if (!toastMessage) return;
    const timerId = window.setTimeout(() => {
      setToastMessage("");
    }, 2000);
    return () => {
      window.clearTimeout(timerId);
    };
  }, [toastMessage]);

  if (!authenticated) return null;
  if (pathname.startsWith("/send/")) return null;

  return (
    <>
      {toastMessage ? (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-[8px] bg-[#111] px-4 py-[10px] text-[14px] text-white">
          {toastMessage}
        </div>
      ) : null}
      <nav
        className="fixed bottom-0 left-1/2 z-20 w-full max-w-[390px] -translate-x-1/2 bg-white"
        style={{ borderTop: "0.5px solid #f0f0f0" }}
      >
        <div className="flex h-16 w-full items-center justify-around pb-safe">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            if (tab.href === "/receive") {
              return (
                <button
                  key={tab.href}
                  type="button"
                  className="flex flex-1 flex-col items-center justify-center gap-1"
                  aria-label={tab.label}
                  onClick={async () => {
                    try {
                      if (!nickname) {
                        setToastMessage("닉네임 정보를 찾을 수 없습니다");
                        return;
                      }
                      const myLink = `https://nuvo-pi.vercel.app/send/${nickname}`;
                      await navigator.clipboard.writeText(myLink);
                      setToastMessage("링크가 복사됐습니다");
                    } catch {
                      setToastMessage("복사에 실패했습니다");
                    }
                  }}
                >
                  <div className="relative flex h-6 w-6 items-center justify-center">
                    {tab.icon(false)}
                  </div>
                  <span className="text-[11px] leading-none text-[#bbbbbb]">
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-1 flex-col items-center justify-center gap-1"
                aria-label={tab.label}
              >
                <div className="relative flex h-6 w-6 items-center justify-center">
                  {active ? (
                    <span className="absolute -top-1 h-1 w-1 rounded-full bg-[#111111]" />
                  ) : null}
                  {tab.icon(active)}
                </div>
                <span
                  className={`text-[11px] leading-none ${
                    active ? "text-[#111111]" : "text-[#bbbbbb]"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
