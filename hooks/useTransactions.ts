"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type BaseScanTxItem = {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
};

type BaseScanResponse = {
  status: string;
  message: string;
  result: BaseScanTxItem[] | string;
};

type UserNicknameRow = {
  wallet_address: string | null;
  nickname: string | null;
};

export type TransactionDisplayItem = {
  hash: string;
  fromAddress: string;
  toAddress: string;
  counterpartyAddress: string;
  value: string;
  timestamp: string;
  isOutgoing: boolean;
};

type NicknameMap = Record<string, string>;

type UseTransactionsResult = {
  displayItems: TransactionDisplayItem[];
  nicknameMap: NicknameMap;
  isLoading: boolean;
  isError: boolean;
};

const BASESCAN_API_URL =
  process.env.NEXT_PUBLIC_BASESCAN_API_URL ?? "https://api.etherscan.io/v2/api";
const BASESCAN_API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY;

function normalizeAddress(address: string | null | undefined): string {
  return (address ?? "").trim().toLowerCase();
}

function shortenAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getInitial(label: string): string {
  const normalized = label.trim();
  if (!normalized) return "?";
  return normalized[0].toUpperCase();
}

export function getDateLabel(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
  }).format(date);
}

export function formatEthValue(value: string): string {
  const num = parseFloat(value);
  if (!Number.isFinite(num) || num <= 0) return "0 ETH";
  if (num < 0.0001) return "< 0.0001 ETH";
  if (num < 0.001) return `${num.toFixed(6)} ETH`;
  return `${num.toFixed(4)} ETH`;
}

export function getCounterpartyLabel(
  tx: TransactionDisplayItem,
  nicknameMap: NicknameMap,
): string {
  const nickname = nicknameMap[normalizeAddress(tx.counterpartyAddress)];
  if (nickname) return nickname;
  return shortenAddress(tx.counterpartyAddress);
}

export function useTransactions(address?: string): UseTransactionsResult {
  const [displayItems, setDisplayItems] = useState<TransactionDisplayItem[]>([]);
  const [nicknameMap, setNicknameMap] = useState<NicknameMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const normalizedAddress = normalizeAddress(address);
    if (!normalizedAddress) {
      setDisplayItems([]);
      setNicknameMap({});
      setIsLoading(false);
      setIsError(false);
      return;
    }

    let cancelled = false;

    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        if (!BASESCAN_API_KEY) {
          throw new Error("NEXT_PUBLIC_BASESCAN_API_KEY is missing");
        }

        const endpoint = new URL(BASESCAN_API_URL);
        endpoint.searchParams.set("module", "account");
        endpoint.searchParams.set("action", "txlist");
        endpoint.searchParams.set("chainid", "84532");
        endpoint.searchParams.set("address", normalizedAddress);
        endpoint.searchParams.set("startblock", "0");
        endpoint.searchParams.set("endblock", "99999999");
        endpoint.searchParams.set("page", "1");
        endpoint.searchParams.set("offset", "30");
        endpoint.searchParams.set("sort", "desc");
        endpoint.searchParams.set("apikey", BASESCAN_API_KEY);

        const response = await fetch(endpoint.toString(), {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch BaseScan transactions");

        const payload = (await response.json()) as BaseScanResponse;
        if (!Array.isArray(payload.result)) {
          // BaseScan은 트랜잭션이 없을 때 result에 문자열을 반환하기도 함
          if (payload.message === "No transactions found") {
            if (cancelled) return;
            setDisplayItems([]);
            setNicknameMap({});
            return;
          }
          throw new Error("Unexpected BaseScan response");
        }

        const nextItems = payload.result.map((tx) => {
          const fromAddress = normalizeAddress(tx.from);
          const toAddress = normalizeAddress(tx.to);
          const isOutgoing = fromAddress === normalizedAddress;
          const counterpartyAddress = isOutgoing ? toAddress : fromAddress;
          const timestamp =
            Number.isFinite(Number(tx.timeStamp)) && Number(tx.timeStamp) > 0
              ? new Date(Number(tx.timeStamp) * 1000).toISOString()
              : "";
          return {
            hash: tx.hash,
            fromAddress,
            toAddress,
            counterpartyAddress,
            value: (Number(tx.value) / 1e18).toString(),
            timestamp,
            isOutgoing,
          };
        });

        const uniqueCounterpartyAddresses = Array.from(
          new Set(nextItems.map((item) => item.counterpartyAddress)),
        ).filter(Boolean);

        let nextNicknameMap: NicknameMap = {};
        if (uniqueCounterpartyAddresses.length > 0) {
          const { data: userRows } = await supabase
            .from("users")
            .select("wallet_address,nickname")
            .in("wallet_address", uniqueCounterpartyAddresses);

          const rows = (userRows ?? []) as UserNicknameRow[];
          nextNicknameMap = rows.reduce<NicknameMap>((acc, row) => {
            const key = normalizeAddress(row.wallet_address);
            const nickname = row.nickname?.trim();
            if (key && nickname) acc[key] = nickname;
            return acc;
          }, {});
        }

        if (cancelled) return;
        setDisplayItems(nextItems);
        setNicknameMap(nextNicknameMap);
      } catch {
        if (cancelled) return;
        setDisplayItems([]);
        setNicknameMap({});
        setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchTransactions();
    return () => {
      cancelled = true;
    };
  }, [address]);

  return { displayItems, nicknameMap, isLoading, isError };
}
