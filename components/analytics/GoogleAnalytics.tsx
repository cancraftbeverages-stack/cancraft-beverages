"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { FORM_START_EVENT } from "@/lib/attribution/browser";
import { ENQUIRY_SUBMIT_EVENT, gaMeasurementId, initGa, sendGaEvent } from "@/lib/analytics/ga";

/**
 * Google Analytics 4, loaded only when NEXT_PUBLIC_GA_MEASUREMENT_ID holds a valid measurement ID
 * (G-XXXXXXX). Without it this renders nothing and makes no request.
 *
 * Privacy: automatic page views are off; page_view is sent by this component with a sanitised URL
 * (path + clean utm_* only) and the referrer's origin only. Google signals and ad personalisation are
 * disabled. Only page_view, form_start and enquiry_submit are sent, with no form values.
 * GA4 property settings to match (Admin → Data streams → Enhanced measurement): turn OFF "Page changes
 * based on browser history events" and "Form interactions" (they would send unsanitised URLs and a
 * duplicate form_start).
 */
export function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  const id = gaMeasurementId(measurementId);
  const pathname = usePathname();

  // Queue js + config before any event (gtag.js replays the queue in order once loaded).
  useEffect(() => {
    if (id) initGa(id);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    sendGaEvent("page_view");
  }, [id, pathname]);

  useEffect(() => {
    if (!id) return;
    const onStart = () => sendGaEvent("form_start");
    const onSubmit = () => sendGaEvent("enquiry_submit");
    window.addEventListener(FORM_START_EVENT, onStart);
    window.addEventListener(ENQUIRY_SUBMIT_EVENT, onSubmit);
    return () => {
      window.removeEventListener(FORM_START_EVENT, onStart);
      window.removeEventListener(ENQUIRY_SUBMIT_EVENT, onSubmit);
    };
  }, [id]);

  if (!id) return null;
  return <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />;
}
