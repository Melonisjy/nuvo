'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { baseSepolia } from 'viem/chains';
import BottomTabBar from '@/components/BottomTabBar';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            config={{
                loginMethods: ['google', 'email'],
                supportedChains: [baseSepolia],
                defaultChain: baseSepolia,
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'users-without-wallets',
                    },
                },
                appearance: {
                    theme: 'light',
                    accentColor: '#3182F6',
                },
            }}
        >
            <div className="pb-24">
                {children}
            </div>
            <BottomTabBar />
        </PrivyProvider>
    );
}