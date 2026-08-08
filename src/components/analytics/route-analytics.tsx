"use client";

import { useEffect, useRef } from "react";

import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

export function RouteAnalytics({ name, detail }: { name: AnalyticsEvent; detail: Record<string, unknown> }) {
  const lastSentKey = useRef("");
  const detailKey = JSON.stringify(detail);
  useEffect(() => {
    const eventKey = `${name}:${detailKey}`;
    if (lastSentKey.current === eventKey) return;
    lastSentKey.current = eventKey;
    trackEvent(name, detail);
  }, [detail, detailKey, name]);
  return null;
}
