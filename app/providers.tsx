'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { baseSepolia } from 'viem/chains';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: 1,
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
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
                {children}
            </PrivyProvider>
        </QueryClientProvider>
    );
}