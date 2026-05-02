'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  slug: string;
}

export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch('/api/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        });
      } catch (err) {
        console.error('Failed to track view:', err);
      }
    };

    // Track after a short delay to avoid tracking accidental bounces
    const timer = setTimeout(trackView, 3000);
    return () => clearTimeout(timer);
  }, [slug]);

  return null;
}
