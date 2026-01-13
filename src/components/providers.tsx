"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { createTheme, MantineProvider } from "@mantine/core";

const theme = createTheme({
	primaryColor: "sky",
	primaryShade: { light: 6, dark: 5 },
	colors: {
		sky: [
			"#e7f5ff",
			"#d0ebff",
			"#a5d8ff",
			"#74c0fc",
			"#4dabf7",
			"#339af0",
			"#228be6",
			"#1c7ed6",
			"#1971c2",
			"#1864ab",
		],
		obsidian: [
			"#f8f9fa",
			"#f1f3f5",
			"#e9ecef",
			"#dee2e6",
			"#ced4da",
			"#adb5bd",
			"#868e96",
			"#495057",
			"#343a40",
			"#212529",
		],
	},
	components: {
		Paper: {
			styles: {
				root: {
					backgroundColor: "rgba(10, 12, 18, 0.95)",
				},
			},
		},
	},
});

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider
			appearance={{
				variables: {
					colorBackground: "#102544",
					colorText: "#f1f3f5",
					colorInputBackground: "#0f1c33",
					colorInputText: "#f8f9fa",
					colorPrimary: "#4dabf7",
					colorTextSecondary: "#adb5bd",
				},
			}}
		>
			<MantineProvider theme={theme} defaultColorScheme="dark">
				{children}
			</MantineProvider>
		</ClerkProvider>
	);
}
