"use client";

import { StagewiseToolbar } from '@stagewise/toolbar-next';
import ReactPlugin from '@stagewise-plugins/react';
import { useEffect, useState } from 'react';

export function StagewiseToolbarWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />;
} 