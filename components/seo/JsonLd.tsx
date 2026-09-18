type JsonLdProps = {
  data: Record<string, unknown>;
};

/**
 * Renders a `<script type="application/ld+json">` tag. `data` must come
 * only from our own verified content (content/company.ts, route params we
 * control) — never from user input — but the JSON is still escaped against
 * a `</script>` breakout as defense in depth.
 */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  // eslint-disable-next-line react/no-danger
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
