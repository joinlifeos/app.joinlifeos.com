'use client';

import { useEffect } from 'react';
import { SideDock } from '@/components/ui/side-dock';
import { EnhancedSettingsModal } from '@/components/enhanced-settings-modal';
import { ApiKeyModal } from '@/components/api-key-modal';
import { Camera, RefreshCw, Settings } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function SideDockProvider({ children }: { children: React.ReactNode }) {
  const { setShowSettings } = useAppStore();

  // Ensure settings modal is closed on first load
  useEffect(() => {
    setShowSettings(false);
  }, [setShowSettings]);

  const dockItems = [
    {
      title: 'LifeCapture',
      icon: <Camera className="h-full w-full" />,
      href: '/',
    },
    {
      title: 'LifeSync',
      icon: <RefreshCw className="h-full w-full" />,
      href: '/lifesync',
    },
    {
      title: 'Settings',
      icon: <Settings className="h-full w-full" />,
      onClick: () => setShowSettings(true),
    },
  ];

  return (
    <>
      {children}
      <SideDock items={dockItems} position="left" />
      <EnhancedSettingsModal />
      <ApiKeyModal />
    </>
  );
}

