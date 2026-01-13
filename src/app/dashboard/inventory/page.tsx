import { createSupabaseClient } from "@/lib/supabase";
import { Stack, Text, Title } from "@mantine/core";
import { unstable_noStore as noStore } from "next/cache";
import { InventoryManager } from "@/components/inventory/InventoryManager";

export default async function InventoryPage() {
	noStore();
	const supabase = createSupabaseClient();
	const { data } = await supabase
		.from("inventory_items")
		.select("id, created_at, name, sku, quantity, location, status, notes")
		.order("created_at", { ascending: false });

	return (
		<Stack gap="xl">
			<Stack gap={6}>
				<Title order={1}>Inventory</Title>
				<Text c="dimmed">
					Manage deployable assets, hardware kits, and vendor allocations.
				</Text>
			</Stack>
			<InventoryManager items={data ?? []} />
		</Stack>
	);
}

