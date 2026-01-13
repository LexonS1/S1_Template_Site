import { auth } from "@clerk/nextjs/server";
import { Anchor, Container, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
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
		<Container size="md" py="xl">
			<Stack gap="xl" mt={60}>
				<Stack gap="xs">
					<Title order={1}>Store Command</Title>
					<Text c="dimmed">A retail operations hub for inventory, vendors, and fulfillment.</Text>
				</Stack>

				<Group>
					<Anchor
						href="/sign-in"
						size="lg"
						fw={600}
						style={{
							padding: "10px 20px",
							backgroundColor: "var(--mantine-color-sky-filled)",
							color: "white",
							borderRadius: "var(--mantine-radius-default)",
							textDecoration: "none",
						}}
					>
						Sign in to continue
					</Anchor>
					<Text size="sm" c="dimmed">
						Dashboard routes require an active session.
					</Text>
				</Group>

				<Paper withBorder radius="lg" p="lg">
					<Stack gap="md">
						<Title order={3}>Explore the workflows</Title>
						<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
							{[
								{
									href: "/dashboard/intake",
									title: "Vendor intake",
									description: "Register suppliers, catalog items, and terms.",
								},
								{
									href: "/dashboard/ops",
									title: "Store request",
									description: "Request replenishments and store services.",
								},
								{
									href: "/dashboard/risk",
									title: "Issue review",
									description: "Track incidents, returns, and escalations.",
								},
							].map((item) => (
								<Paper key={item.href} withBorder radius="md" p="md">
									<Stack gap={6}>
										<Link href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
											<Anchor component="span" fw={600}>
												{item.title}
											</Anchor>
										</Link>
										<Text size="sm" c="dimmed">
											{item.description}
										</Text>
									</Stack>
								</Paper>
							))}
						</SimpleGrid>
					</Stack>
				</Paper>
			</Stack>
		</Container>
	);
}
