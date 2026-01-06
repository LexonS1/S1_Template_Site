import { auth } from "@clerk/nextjs/server";
import { Anchor, Container, Stack, Text, Title } from "@mantine/core";
import { redirect } from "next/navigation";

export default async function Home() {
	// Skip auth check in CI/test environments (see middleware.ts for details)
	if (!process.env.CI && !process.env.PLAYWRIGHT_TEST) {
		const { userId } = await auth();

		if (userId) {
			redirect("/dashboard");
		}
	}

	return (
		<Container size="sm" py="xl">
			<Stack align="center" gap="lg" mt={100}>
				<Title order={1}>Welcome</Title>
				<Text c="dimmed">Sign in to get started</Text>
				<Anchor
					href="/sign-in"
					size="lg"
					fw={500}
					style={{
						padding: "10px 20px",
						backgroundColor: "var(--mantine-color-blue-filled)",
						color: "white",
						borderRadius: "var(--mantine-radius-default)",
						textDecoration: "none",
					}}
				>
					Sign In
				</Anchor>
			</Stack>
		</Container>
	);
}
