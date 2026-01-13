"use server";

import { createSupabaseClient } from "@/lib/supabase";

type SellActionState = {
	ok: boolean;
	message: string;
	quantity?: number;
	status?: string;
};

export async function sellInventoryItem(
	_prevState: SellActionState,
	formData: FormData,
): Promise<SellActionState> {
	const id = String(formData.get("id") ?? "").trim();
	const amountRaw = String(formData.get("amount") ?? "1").trim();
	const amount = Number.parseInt(amountRaw, 10);

	if (!id) {
		return { ok: false, message: "Missing item id." };
	}

	if (Number.isNaN(amount) || amount <= 0) {
		return { ok: false, message: "Enter a valid amount." };
	}

	const supabase = createSupabaseClient();
	const { data, error } = await supabase
		.from("inventory_items")
		.select("quantity, status")
		.eq("id", id)
		.single();

	if (error || !data) {
		return { ok: false, message: "Unable to find the item." };
	}

	const currentQty = typeof data.quantity === "number" ? data.quantity : 0;
	if (currentQty <= 0) {
		return { ok: false, message: "Item is sold out." };
	}

	const soldAmount = Math.min(amount, currentQty);
	const nextQty = Math.max(0, currentQty - soldAmount);
	const nextStatus = nextQty === 0 ? "sold_out" : data.status;

	const { error: updateError } = await supabase
		.from("inventory_items")
		.update({ quantity: nextQty, status: nextStatus })
		.eq("id", id);

	if (updateError) {
		return { ok: false, message: "Unable to process the sale." };
	}

	const { error: saleError } = await supabase.from("inventory_sales").insert({
		item_id: id,
		quantity: soldAmount,
	});

	return {
		ok: true,
		message:
			saleError != null
				? "Sale recorded (analytics pending)."
				: nextQty === 0
					? "Marked sold out."
					: "Sale recorded.",
		quantity: nextQty,
		status: nextStatus,
	};
}
