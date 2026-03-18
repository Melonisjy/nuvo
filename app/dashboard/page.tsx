'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { base } from 'viem/chains';
import { createPublicClient, formatEther, getAddress, http } from 'viem';

const baseClient = createPublicClient({
    chain: base,
    transport: http('https://mainnet.base.org'), // 공개 Base RPC
});

function formatEth4(value: bigint): string {
    const raw = formatEther(value); // ex) "1.23456789"
    const [intPart, decPart = ''] = raw.split('.');
    return `${intPart}.${decPart.padEnd(4, '0').slice(0, 4)}`; // 소수점 4자리 고정
}

export default function Dashboard() {
    const { authenticated, ready, logout, user } = usePrivy();
    const router = useRouter();

    const [balanceEth, setBalanceEth] = useState<string | null>(null);
    const [isBalanceLoading, setIsBalanceLoading] = useState(false);

    useEffect(() => {
        if (ready && !authenticated) {
            router.replace('/');
        }
    }, [ready, authenticated, router]);

    useEffect(() => {
        const address = user?.wallet?.address;

        // 주소 없을 때 null-safe 처리
        if (!ready || !authenticated || !address) {
            setBalanceEth(null);
            setIsBalanceLoading(false);
            return;
        }

        let cancelled = false;

        const fetchBalance = async () => {
            try {
                setIsBalanceLoading(true);

                // 체크섬/유효성 보정
                const checksumAddress = getAddress(address);
                const wei = await baseClient.getBalance({ address: checksumAddress });
                const formatted = formatEth4(wei);

                if (!cancelled) setBalanceEth(formatted);
            } catch (error) {
                console.error('Failed to fetch Base ETH balance:', error);
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
        <main className="flex justify-center bg-gray-50 min-h-screen">
            <div className="w-full max-w-[390px] bg-white min-h-screen flex flex-col relative">
                {/* 상단 */}
                <div className="flex justify-between items-center px-6 pt-14 pb-2">
                    <span className="text-gray-400 text-sm">안녕하세요</span>
                    <button onClick={logout} className="text-gray-400 text-sm">
                        로그아웃
                    </button>
                </div>

                {/* 이름 */}
                <div className="px-6 pb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{user?.google?.name}</h2>
                </div>

                {/* 잔액 카드 */}
                <div className="mx-4 bg-[#3182F6] rounded-3xl p-6 text-white">
                    <p className="text-sm opacity-70 mb-3">총 자산</p>
                    <p className="text-5xl font-bold tracking-tight">
                        {isBalanceLoading ? '불러오는 중...' : `${balanceEth ?? '0.0000'} ETH`}
                    </p>
                    <p className="text-sm opacity-60 mt-2">≈ 0 원</p>
                </div>

                {/* 빠른 메뉴 */}
                <div className="px-4 mt-6 grid grid-cols-2 gap-3">
                    <button className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center gap-2">
                        <span className="text-2xl">↗</span>
                        <span className="text-sm font-medium text-gray-700">보내기</span>
                    </button>
                    <button className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center gap-2">
                        <span className="text-2xl">↙</span>
                        <span className="text-sm font-medium text-gray-700">받기</span>
                    </button>
                </div>

                {/* 지갑 주소 */}
                <div className="mx-4 mt-4 bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs text-gray-400 mb-1">내 지갑 주소</p>
                    <p className="text-xs text-gray-600 font-mono truncate">
                        {user?.wallet?.address ?? '지갑 생성 중...'}
                    </p>
                </div>
            </div>
        </main>
    );
}