'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

interface Props {
    children: ReactNode;
}

export default function ReactQueryProvider({ children }: Props) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools solo se muestran en desarollo */}
            { process.env.NODE_ENV === 'development' && <ReactQueryDevtools /> }
        </QueryClientProvider>
    );
}