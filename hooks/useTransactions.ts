import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatEther } from "viem";

const BASESCAN_API_URL = "https://api-sepolia.basescan.org/api";
const MAX_TRANSACTIONS = 10;

type BasescanTx = {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError: string;
};

type BasescanResponse = {
  status: string;
  message: string;
  result: BasescanTx[] | string;
};

export type TransactionItem = {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  isOutgoing: boolean;
};

export type TransactionDisplayItem = TransactionItem & {
  fromLabel: string;
  toLabel: string;
};

function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function fetchNicknameMap(addresses: string[]): Promise<Map<string, string>> {
  const normalized = Array.from(
    new Set(addresses.filter(Boolean).map((addr) => addr.toLowerCase())),
  );
  if (normalized.length === 0) return new Map();

  const { data, error } = await supabase
    .from("users")
    .select("wallet_address,nickname")
    .in("wallet_address", normalized);

  if (error || !data) return new Map();

  const nicknameMap = new Map<string, string>();
  for (const row of data) {
    const walletAddress = String(row.wallet_address ?? "").toLowerCase();
    const nickname = String(row.nickname ?? "");
    if (walletAddress && nickname) {
      nicknameMap.set(walletAddress, nickname);
    }
  }

  return nicknameMap;
}

async function fetchTransactions(address: string): Promise<TransactionItem[]> {
  const apiKey = process.env.NEXT_PUBLIC_BASESCAN_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_BASESCAN_API_KEY is missing");
  }

  const url = new URL(BASESCAN_API_URL);
  url.searchParams.set("module", "account");
  url.searchParams.set("action", "txlist");
  url.searchParams.set("address", address);
  url.searchParams.set("apikey", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch transactions");

  const json = (await res.json()) as BasescanResponse;
  if (!Array.isArray(json.result)) return [];

  const currentAddress = address.toLowerCase();

  return json.result
    .filter((tx) => tx.isError !== "1")
    .filter((tx) => tx.value !== "0")
    .map((tx) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: formatEther(BigInt(tx.value)),
      timestamp: Number(tx.timeStamp),
      isOutgoing: tx.from.toLowerCase() === currentAddress,
    }))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_TRANSACTIONS);
}

export function getDateLabel(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffDays = Math.floor(
    (todayStart.getTime() - targetStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  if (diffDays === 1) return "어제";
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function getCounterpartyLabel(
  tx: TransactionItem,
  nicknameMap: Map<string, string>,
): string {
  const counterparty = (tx.isOutgoing ? tx.to : tx.from).toLowerCase();
  return nicknameMap.get(counterparty) ?? shortenAddress(counterparty);
}

export function getInitial(value: string): string {
  return value?.charAt(0)?.toUpperCase() || "?";
}

export function useTransactions(address?: string) {
  const normalizedAddress = address?.toLowerCase();

  return useQuery({
    queryKey: ["transactions", normalizedAddress],
    enabled: Boolean(normalizedAddress),
    staleTime: 30 * 1000,
    queryFn: async () => {
      const txs = await fetchTransactions(normalizedAddress!);
      const participants = txs.flatMap((tx) => [tx.from, tx.to]);
      const nicknameMap = await fetchNicknameMap(participants);

      const displayItems: TransactionDisplayItem[] = txs.map((tx) => ({
        ...tx,
        fromLabel: nicknameMap.get(tx.from.toLowerCase()) ?? shortenAddress(tx.from),
        toLabel: nicknameMap.get(tx.to.toLowerCase()) ?? shortenAddress(tx.to),
      }));

      return { transactions: txs, nicknameMap, displayItems };
    },
  });
}
