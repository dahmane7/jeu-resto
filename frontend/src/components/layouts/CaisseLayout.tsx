import { ReactNode } from 'react';

interface CaisseLayoutProps {
  children: ReactNode;
}

export default function CaisseLayout({ children }: CaisseLayoutProps) {
  return <div className="min-h-screen bg-gray-50 p-6">{children}</div>;
}
