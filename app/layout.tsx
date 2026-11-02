import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { SavedProvider } from '@/contexts/SavedContext';
import { SiteShell } from '@/components/layout/SiteShell';
import './globals.css';
import { ConsentAndTracking } from '@/components/analytics/ConsentAndTracking';
export const metadata: Metadata = {
  title: { default: 'CampusFind | Lost & Found Portal', template: '%s | CampusFind' },
  description: 'Report and recover lost campus items, browse found belongings, and submit ownership claims securely.',
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body><AuthProvider><SavedProvider><SiteShell>{children}</SiteShell><ConsentAndTracking/></SavedProvider></AuthProvider></body></html>;
}
