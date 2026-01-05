"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  primaryColor: "blue",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <MantineProvider theme={theme}>{children}</MantineProvider>
    </ClerkProvider>
  );
}
