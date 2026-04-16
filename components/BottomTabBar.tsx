"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const { authenticated } = usePrivy();
  const pathname = usePathname();

  if (!authenticated) return null;
  if (pathname.startsWith("/send/")) return null;

  return (
    <>
      <nav
        className="fixed bottom-0 left-1/2 z-20 w-full max-w-[390px] -translate-x-1/2 bg-white"
        style={{ borderTop: "0.5px solid #f0f0f0" }}
      >
        <div className="flex h-16 w-full items-center justify-around pb-safe">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
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
