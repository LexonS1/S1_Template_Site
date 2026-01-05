import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
};

export default withSentryConfig(nextConfig, {
	org: process.env.SENTRY_ORG,
	project: process.env.SENTRY_PROJECT,
	silent: !process.env.CI,
	widenClientFileUpload: true,
	webpack: {
		reactComponentAnnotation: {
			enabled: true,
		},
		treeshake: {
			removeDebugLogging: true,
		},
	},
});
