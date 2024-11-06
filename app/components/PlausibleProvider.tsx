"use client";

import PlausibleProvider from 'next-plausible';

export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlausibleProvider domain="trustbank.tech">
      {children}
    </PlausibleProvider>
  );
}