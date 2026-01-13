import { createSupabaseClient } from "@/lib/supabase";
import { Stack, Text, Title } from "@mantine/core";
import { unstable_noStore as noStore } from "next/cache";
import { ShopInventory } from "@/components/shop/ShopInventory";

export default async function ShopPage() {
	noStore();
	const supabase = createSupabaseClient();
	const { data } = await supabase
		.from("inventory_items")
		.select("id, name, sku, quantity, status")
		.order("created_at", { ascending: false });

	return (
		<Stack gap="lg">
			<Stack gap={4}>
				<Title order={2}>Shop</Title>
				<Text c="dimmed">
					Sell through inventory and mark items sold out when stock hits zero.
				</Text>
			</Stack>
			<ShopInventory items={data ?? []} />
		</Stack>
	);
}

