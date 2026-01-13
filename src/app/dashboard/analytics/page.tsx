import { SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { unstable_noStore as noStore } from "next/cache";
import { CycleTimeChart } from "@/components/analytics/CycleTimeChart";
import { MetricsCards } from "@/components/analytics/MetricsCards";
import { PipelineHealth } from "@/components/analytics/PipelineHealth";
import { RestockPriorities } from "@/components/analytics/RestockPriorities";
import { WeeklyIntakeChart } from "@/components/analytics/WeeklyIntakeChart";
import { createSupabaseClient } from "@/lib/supabase";

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

	const [{ data: submissions }, { data: forecast }, { data: sales }, { data: inventory }] =
		await Promise.all([
			supabase
				.from("dashboard_submissions")
				.select("created_at")
				.gte("created_at", sevenDaysAgo.toISOString()),
			supabase.from("delivery_forecast").select("created_at, due_date, status, risk").limit(200),
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
		topItemId && inventoryById.has(topItemId) ? inventoryById.get(topItemId) : "--";

	const restockThreshold = 5;
	const restockItems = inventoryRows
		.filter((row) => typeof row.quantity === "number" && row.quantity <= restockThreshold)
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
			value: mostSoldItem ?? "--",
			note: topItemCount ? `${topItemCount} units` : "No sales yet",
		},
		{
			label: "Needs restock",
			value: restockCount.toString(),
			note: `Qty <= ${restockThreshold}`,
		},
	];

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
				<Text c="dimmed">Signal-level performance across intake, ops, and risk queues.</Text>
			</Stack>
			<MetricsCards metrics={metrics} />
			<RestockPriorities items={restockItems} />
			<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
				<WeeklyIntakeChart points={weeklyIntake} />
				<CycleTimeChart points={trendPoints} hasData={cycleTimeTrend.length > 0} />
			</SimpleGrid>
			<PipelineHealth items={statusMix} />
		</Stack>
	);
}
