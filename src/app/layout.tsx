import "@mantine/core/styles.css";
import { ColorSchemeScript } from "@mantine/core";
import { Providers } from "@/components/providers";

export const metadata = {
  title: "Next.js Boilerplate",
  description: "Next.js with Clerk, Supabase, Mantine, and Sentry",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
