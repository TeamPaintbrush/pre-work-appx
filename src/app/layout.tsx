import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Header from '../components/Layout/Header';
import { DebugProvider } from '../components/Debug/DebugProvider';
import { AccessibilityProvider } from '../components/Accessibility/AccessibilityProvider';
import { FeatureToggleProvider } from '../components/AdvancedFeatures/FeatureToggleProvider';
import { AmplifyProvider } from '../components/AWS/AmplifyProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Pre-Work App - Checklist Management System',
  description: 'Streamline your pre-work processes with comprehensive checklist management for cleaning and maintenance projects.',
  keywords: 'checklist, prework, cleaning, maintenance, project management, task management',
  authors: [{ name: 'The Pre-Work App Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <AmplifyProvider>
          <AccessibilityProvider>
            <DebugProvider enableInProduction={false} showConsoleByDefault={true}>
              <FeatureToggleProvider>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow">
                    {children}
                  </main>
                </div>
              </FeatureToggleProvider>
            </DebugProvider>
          </AccessibilityProvider>
        </AmplifyProvider>
      </body>
    </html>
  );
}