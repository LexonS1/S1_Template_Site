import { Stack, Text, Title } from "@mantine/core";
import { unstable_noStore as noStore } from "next/cache";
import { ForecastManager } from "@/components/forecast/ForecastManager";
import { createSupabaseClient } from "@/lib/supabase";

export default async function ForecastPage() {
	noStore();
	const supabase = createSupabaseClient();
	const { data } = await supabase
		.from("delivery_forecast")
		.select("id, created_at, project_name, owner, due_date, status, risk, notes")
		.order("due_date", { ascending: true });

	return (
		<Stack gap="xl">
			<Stack gap="sm">
				<Title order={1}>Delivery forecast</Title>
				<Text c="dimmed" mt="xs">
					Plan the next wave of delivery with owners, dates, and risk.
				</Text>
			</Stack>
			<ForecastManager items={data ?? []} />
		</Stack>
	);
}
