import dynamic from 'next/dynamic';

const GoogleCallbackPageClient = dynamic(() => import('./GoogleCallbackPageClient'), { ssr: false });

export default function GoogleCallbackPage() {
  return <GoogleCallbackPageClient />;
}