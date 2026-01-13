import { currentUser } from "@clerk/nextjs/server";
import {
	Anchor,
	Badge,
	Group,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import Link from "next/link";

export default async function DashboardPage() {
	const user = await currentUser();
	const name = user?.firstName || user?.emailAddresses[0]?.emailAddress || "Operator";

	return (
		<Stack gap="xl">
			<Paper withBorder radius="lg" p="lg">
				<Stack gap="sm">
					<Group justify="space-between">
						<Title order={2}>Welcome back, {name}</Title>
						<Badge variant="light" color="blue">
							Retail ops live
						</Badge>
					</Group>
					<Text c="dimmed">
						Keep shelves stocked, vendors aligned, and store requests on track.
					</Text>
				</Stack>
			</Paper>

			<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
				{[
					{ label: "Active vendors", value: "12", note: "3 new this week" },
					{ label: "Store requests", value: "7", note: "2 due today" },
					{ label: "Issue flags", value: "4", note: "1 needs review" },
				].map((item) => (
					<Paper key={item.label} withBorder radius="md" p="md">
						<Stack gap={4}>
							<Text c="dimmed" size="sm">
								{item.label}
							</Text>
							<Text fw={700} size="xl">
								{item.value}
							</Text>
							<Text size="sm" c="dimmed">
								{item.note}
							</Text>
						</Stack>
					</Paper>
				))}
			</SimpleGrid>

			<Paper withBorder radius="lg" p="lg">
				<Group justify="space-between" mb="md">
					<Title order={3}>Quick actions</Title>
					<Text size="sm" c="dimmed">
						Shortcuts to key workflows
					</Text>
				</Group>
				<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
					{[
						{
							href: "/dashboard/intake",
							title: "New vendor",
							description: "Register a supplier or catalog update.",
						},
						{
							href: "/dashboard/ops",
							title: "Store request",
							description: "Request replenishment or services.",
						},
						{
							href: "/dashboard/risk",
							title: "Issue review",
							description: "Log incidents, returns, or delays.",
						},
					].map((item) => (
							<Paper key={item.href} withBorder radius="md" p="md">
								<Stack gap={6}>
									<Link
										href={item.href}
										style={{ textDecoration: "none", color: "inherit" }}
									>
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
			</Paper>
		</Stack>
	);
}
