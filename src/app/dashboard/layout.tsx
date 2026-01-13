import { UserButton } from "@clerk/nextjs";
import { Box, Container, Divider, Group, Paper, Stack, Text } from "@mantine/core";
import Link from "next/link";

const navSections = [
	{
		title: "Operations",
		items: [
			{
				href: "/dashboard",
				label: "Store Overview",
			},
			{
				href: "/dashboard/intake",
				label: "Vendor Intake",
			},
			{
				href: "/dashboard/ops",
				label: "Store Request",
			},
			{
				href: "/dashboard/risk",
				label: "Issue Review",
			},
		],
	},
	{
		title: "Insights",
		items: [
			{
				href: "/dashboard/shop",
				label: "Shop",
			},
			{
				href: "/dashboard/analytics",
				label: "Sales Analytics",
			},
			{
				href: "/dashboard/inventory",
				label: "Inventory",
			},
			{
				href: "/dashboard/forecast",
				label: "Delivery Forecast",
			},
		],
	},
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<Box
			style={{
				minHeight: "100vh",
				background:
					"radial-gradient(circle at top left, rgba(77, 171, 247, 0.18), transparent 55%), radial-gradient(circle at top right, rgba(94, 114, 228, 0.18), transparent 45%), #0f1b2e",
			}}
		>
			<Container size="xl" py="xl">
				<Group align="flex-start" gap="xl" wrap="nowrap">
					<Paper
						withBorder
						radius="lg"
						p="lg"
						style={{ width: 260, backgroundColor: "rgba(10, 12, 18, 0.95)" }}
					>
						<Stack gap="lg">
							<Group justify="space-between" align="center">
								<Stack gap={2}>
									<Text
										size="xs"
										c="dimmed"
										tt="uppercase"
										fw={600}
										style={{ letterSpacing: "0.12em" }}
									>
										Retail Ops
									</Text>
									<Text fw={700}>Store Command</Text>
								</Stack>
								<UserButton />
							</Group>
							<Divider />
							<Stack gap="lg">
								{navSections.map((section) => (
									<Stack key={section.title} gap="xs">
										<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
											{section.title}
										</Text>
										<Stack gap={4}>
											{section.items.map((item) => (
												<Link
													key={item.href}
													href={item.href}
													style={{ textDecoration: "none", color: "inherit" }}
												>
													<Paper
														withBorder
														radius="md"
														p="sm"
														style={{
															background:
																"linear-gradient(135deg, rgba(18, 22, 34, 0.95), rgba(12, 16, 26, 0.95))",
														}}
													>
														<Text fw={600} size="sm">
															{item.label}
														</Text>
													</Paper>
												</Link>
											))}
										</Stack>
									</Stack>
								))}
							</Stack>
						</Stack>
					</Paper>

					<Stack gap="xl" style={{ flex: 1 }}>
						{children}
					</Stack>
				</Group>
			</Container>
		</Box>
	);
}
