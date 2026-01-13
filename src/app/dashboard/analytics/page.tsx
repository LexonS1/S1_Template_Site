import { createSupabaseClient } from "@/lib/supabase";
import { Box, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { unstable_noStore as noStore } from "next/cache";

type SubmissionRow = {
	created_at: string;
};

type ForecastRow = {
	created_at: string;
	due_date: string;
	status: string;
	risk: string;
};

type SalesRow = {
	item_id: string;
	quantity: number;
	created_at: string;
};

type InventoryRow = {
	id: string;
	name: string;
	quantity: number;
};

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toUtcDateKey(date: Date) {
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
		2,
		"0",
	)}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function daysBetween(start: Date, end: Date) {
	const msPerDay = 24 * 60 * 60 * 1000;
	return Math.round((end.getTime() - start.getTime()) / msPerDay);
}

export default async function AnalyticsPage() {
	noStore();
	const supabase = createSupabaseClient();
	const now = new Date();
	const thirtyDaysAgo = new Date(now);
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const last7Days: Date[] = Array.from({ length: 7 }, (_, index) => {
		const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
		date.setUTCDate(date.getUTCDate() - (6 - index));
		return date;
	});

	const sevenDaysAgo = new Date(last7Days[0]);

	const [
		{ data: submissions },
		{ data: forecast },
		{ data: sales },
		{ data: inventory },
	] = await Promise.all([
		supabase
			.from("dashboard_submissions")
			.select("created_at")
			.gte("created_at", sevenDaysAgo.toISOString()),
		supabase
			.from("delivery_forecast")
			.select("created_at, due_date, status, risk")
			.limit(200),
		supabase
			.from("inventory_sales")
			.select("item_id, quantity, created_at")
			.gte("created_at", thirtyDaysAgo.toISOString()),
		supabase.from("inventory_items").select("id, name, quantity"),
	]);

	const submissionCounts: Record<string, number> = {};
	for (const date of last7Days) {
		submissionCounts[toUtcDateKey(date)] = 0;
	}
	(submissions as SubmissionRow[] | null)?.forEach((row) => {
		const key = toUtcDateKey(new Date(row.created_at));
		if (key in submissionCounts) {
			submissionCounts[key] += 1;
		}
	});

	const weeklyIntake = last7Days.map((date) => ({
		label: dayLabels[date.getUTCDay()],
		value: submissionCounts[toUtcDateKey(date)] ?? 0,
	}));

	const forecastRows = (forecast as ForecastRow[] | null) ?? [];
	const trendWindow = forecastRows.slice(0, 8);
	const cycleTimeTrend = trendWindow.map((row) => {
		const created = new Date(row.created_at);
		const due = new Date(row.due_date);
		return Math.max(0, daysBetween(created, due));
	});

	const statusCounts: Record<string, number> = {
		planned: 0,
		in_progress: 0,
		at_risk: 0,
		delivered: 0,
	};

	forecastRows.forEach((row) => {
		if (row.status in statusCounts) statusCounts[row.status] += 1;
	});

	const totalForecast = forecastRows.length || 1;
	const statusMix = [
		{
			label: "Planned",
			value: Math.round((statusCounts.planned / totalForecast) * 100),
			color: "#4dabf7",
		},
		{
			label: "In progress",
			value: Math.round((statusCounts.in_progress / totalForecast) * 100),
			color: "#22b8cf",
		},
		{
			label: "At risk",
			value: Math.round((statusCounts.at_risk / totalForecast) * 100),
			color: "#f59f00",
		},
		{
			label: "Delivered",
			value: Math.round((statusCounts.delivered / totalForecast) * 100),
			color: "#74c0fc",
		},
	];

	const salesRows = (sales as SalesRow[] | null) ?? [];
	const inventoryRows = (inventory as InventoryRow[] | null) ?? [];

	const totalSold = salesRows.reduce(
		(total, row) => total + (typeof row.quantity === "number" ? row.quantity : 0),
		0,
	);
	const salesByItem = new Map<string, number>();
	for (const row of salesRows) {
		const current = salesByItem.get(row.item_id) ?? 0;
		salesByItem.set(row.item_id, current + (row.quantity ?? 0));
	}
	let topItemId: string | null = null;
	let topItemCount = 0;
	for (const [itemId, count] of salesByItem.entries()) {
		if (count > topItemCount) {
			topItemId = itemId;
			topItemCount = count;
		}
	}
	const inventoryById = new Map(inventoryRows.map((row) => [row.id, row.name]));
	const mostSoldItem =
		topItemId && inventoryById.has(topItemId)
			? inventoryById.get(topItemId)
			: "—";

	const restockThreshold = 5;
	const restockItems = inventoryRows
		.filter(
			(row) =>
				typeof row.quantity === "number" && row.quantity <= restockThreshold,
		)
		.sort((a, b) => a.quantity - b.quantity)
		.slice(0, 3);
	const restockCount = inventoryRows.filter(
		(row) => typeof row.quantity === "number" && row.quantity <= restockThreshold,
	).length;

	const metrics = [
		{
			label: "Items sold (30d)",
			value: totalSold.toString(),
			note: "Based on shop sales",
		},
		{
			label: "Most sold item",
			value: mostSoldItem ?? "—",
			note: topItemCount ? `${topItemCount} units` : "No sales yet",
		},
		{
			label: "Needs restock",
			value: restockCount.toString(),
			note: `Qty ≤ ${restockThreshold}`,
		},
	];

	const maxWeekly = Math.max(...weeklyIntake.map((item) => item.value), 1);
	const maxTrend = Math.max(...cycleTimeTrend, 1);
	const minTrend = Math.min(...cycleTimeTrend, 0);
	const trendPoints =
		cycleTimeTrend.length > 1
			? cycleTimeTrend
					.map((value, index) => {
						const x = (index / (cycleTimeTrend.length - 1)) * 280;
						const normalized = (value - minTrend) / (maxTrend - minTrend || 1);
						const y = 80 - normalized * 70;
						return `${x},${y}`;
					})
					.join(" ")
			: "0,80 280,80";

	return (
		<Stack gap="lg">
			<Stack gap={4}>
				<Title order={2}>Analytics</Title>
				<Text c="dimmed">
					Signal-level performance across intake, ops, and risk queues.
				</Text>
			</Stack>
			<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
				{metrics.map((metric) => (
					<Paper key={metric.label} withBorder radius="md" p="md">
						<Stack gap={4}>
							<Text c="dimmed" size="sm">
								{metric.label}
							</Text>
							<Text fw={700} size="xl">
								{metric.value}
							</Text>
							<Text size="sm" c="dimmed">
								{metric.note}
							</Text>
						</Stack>
					</Paper>
				))}
			</SimpleGrid>

			<Paper withBorder radius="md" p="lg">
				<Stack gap="sm">
					<Group justify="space-between">
						<Title order={3}>Restock priorities</Title>
						<Text size="sm" c="dimmed">
							Top 3 items needing restock
						</Text>
					</Group>
					{restockItems.length === 0 ? (
						<Text size="sm" c="dimmed">
							No low-stock items right now.
						</Text>
					) : (
						<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
							{restockItems.map((item) => (
								<Paper key={item.id} withBorder radius="md" p="md">
									<Stack gap={6}>
										<Text fw={600}>{item.name}</Text>
										<Text size="sm" c="dimmed">
											Qty {item.quantity}
										</Text>
									</Stack>
								</Paper>
							))}
						</SimpleGrid>
					)}
				</Stack>
			</Paper>

			<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
				<Paper withBorder radius="md" p="lg">
					<Stack gap="sm">
						<Group justify="space-between">
							<Title order={3}>Weekly intake</Title>
							<Text size="sm" c="dimmed">
								Last 7 days
							</Text>
						</Group>
						<Group align="flex-end" gap="sm" mt="md">
							{weeklyIntake.map((item) => (
								<Stack key={item.label} gap={6} align="center">
									<Box
										style={{
											width: 18,
											height: `${Math.round((item.value / maxWeekly) * 120)}px`,
											borderRadius: 6,
											background:
												"linear-gradient(180deg, rgba(77, 171, 247, 0.9), rgba(77, 171, 247, 0.4))",
										}}
									/>
									<Text size="xs" c="dimmed">
										{item.label}
									</Text>
								</Stack>
							))}
						</Group>
					</Stack>
				</Paper>

				<Paper withBorder radius="md" p="lg">
					<Stack gap="sm">
						<Group justify="space-between">
							<Title order={3}>Cycle time trend</Title>
							<Text size="sm" c="dimmed">
								Days per delivery
							</Text>
						</Group>
						<Box
							style={{
								width: "100%",
								height: 160,
								borderRadius: 12,
								background:
									"linear-gradient(180deg, rgba(16, 24, 48, 0.9), rgba(9, 12, 24, 0.9))",
								padding: 12,
								display: "flex",
								alignItems: "center",
							}}
						>
							{cycleTimeTrend.length === 0 ? (
								<Text size="sm" c="dimmed">
									Add forecast items to visualize trend.
								</Text>
							) : (
								<svg
									viewBox="0 0 280 120"
									width="100%"
									height="140"
									style={{ overflow: "visible" }}
								>
									<defs>
										<linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor="rgba(77, 171, 247, 0.35)" />
											<stop offset="100%" stopColor="rgba(77, 171, 247, 0)" />
										</linearGradient>
									</defs>
									<polygon
										fill="url(#trendFill)"
										points={`0,120 ${trendPoints} 280,120`}
									/>
									<polyline
										fill="none"
										stroke="rgba(77, 171, 247, 0.45)"
										strokeWidth="12"
										points={trendPoints}
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<polyline
										fill="none"
										stroke="#4dabf7"
										strokeWidth="3"
										points={trendPoints}
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							)}
						</Box>
					</Stack>
				</Paper>
			</SimpleGrid>

			<Paper withBorder radius="md" p="lg">
				<Stack gap="sm">
					<Group justify="space-between">
						<Title order={3}>Pipeline health</Title>
						<Text size="sm" c="dimmed">
							Current delivery mix
						</Text>
					</Group>
					<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
						{statusMix.map((item) => (
							<Paper key={item.label} withBorder radius="md" p="md">
								<Stack gap={6}>
									<Group justify="space-between">
										<Text size="sm" c="dimmed">
											{item.label}
										</Text>
										<Text fw={600}>{item.value}%</Text>
									</Group>
									<Box
										style={{
											height: 6,
											borderRadius: 999,
											backgroundColor: "rgba(255,255,255,0.08)",
										}}
									>
										<Box
											style={{
												height: "100%",
												width: `${item.value}%`,
												borderRadius: 999,
												backgroundColor: item.color,
											}}
										/>
									</Box>
								</Stack>
							</Paper>
						))}
					</SimpleGrid>
				</Stack>
			</Paper>
		</Stack>
	);
}
