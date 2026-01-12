"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { createTheme, MantineProvider } from "@mantine/core";

const theme = createTheme({
	primaryColor: "blue",
});

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider
			appearance={{
				variables: {
					colorBackground: "#3757a8",
					colorText: "#f1f3f5",
					colorInputBackground: "#0059ff",
					colorInputText: "#f1f3f5",
					colorPrimary: "#4dabf7",
				},
			}}
		>
			<MantineProvider theme={theme} defaultColorScheme="dark">
				{children}
			</MantineProvider>
		</ClerkProvider>
	);
}
