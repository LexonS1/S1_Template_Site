import { auth } from "@clerk/nextjs/server";
import { Button, Container, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
	const { userId } = await auth();

	if (userId) {
		redirect("/dashboard");
	}

	return (
		<Container size="sm" py="xl">
			<Stack align="center" gap="lg" mt={100}>
				<Title order={1}>Welcome</Title>
				<Text c="dimmed">Sign in to get started</Text>
				<Button component={Link} href="/sign-in" size="lg">
					Sign In
				</Button>
			</Stack>
		</Container>
	);
}
