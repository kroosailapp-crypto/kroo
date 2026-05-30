import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withSentryConfig(nextConfig, {
  org: "kroo",
  project: "javascript-nextjs",
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
