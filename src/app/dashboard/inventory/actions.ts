"use server";

import { createSupabaseClient } from "@/lib/supabase";
import type { InventoryActionState } from "./form-state";

function buildErrorState(fieldErrors: Record<string, string>): InventoryActionState {
	return {
		ok: false,
		message: "Fix the highlighted fields and try again.",
		fieldErrors,
	};
}

function parseQuantity(value: string) {
	const parsed = Number.parseInt(value, 10);
	if (Number.isNaN(parsed)) {
		return null;
	}
	return parsed;
}

export async function addInventoryItem(
	_prevState: InventoryActionState,
	formData: FormData,
): Promise<InventoryActionState> {
	const name = String(formData.get("name") ?? "").trim();
	const sku = String(formData.get("sku") ?? "").trim();
	const location = String(formData.get("location") ?? "").trim();
	const status = String(formData.get("status") ?? "active").trim();
	const notes = String(formData.get("notes") ?? "").trim();
	const quantityRaw = String(formData.get("quantity") ?? "").trim();

	const fieldErrors: Record<string, string> = {};
	if (!name) fieldErrors.name = "Name is required.";
	if (!sku) fieldErrors.sku = "SKU is required.";
	if (!location) fieldErrors.location = "Location is required.";

	const quantity = parseQuantity(quantityRaw);
	if (quantity === null || quantity < 0) {
		fieldErrors.quantity = "Quantity must be 0 or more.";
	}

	if (Object.keys(fieldErrors).length > 0) {
		return buildErrorState(fieldErrors);
	}

	const nextStatus = quantity === 0 ? "sold_out" : status === "sold_out" ? "active" : status;

	const supabase = createSupabaseClient();
	const { error } = await supabase.from("inventory_items").insert({
		name,
		sku,
		location,
		status: nextStatus,
		notes: notes || null,
		quantity,
	});

	if (error) {
		return {
			ok: false,
			message: "Unable to save the item right now.",
			fieldErrors: {},
		};
	}

	return {
		ok: true,
		message: "Item added.",
		fieldErrors: {},
	};
}

export async function updateInventoryItem(
	_prevState: InventoryActionState,
	formData: FormData,
): Promise<InventoryActionState> {
	const id = String(formData.get("id") ?? "").trim();
	const name = String(formData.get("name") ?? "").trim();
	const sku = String(formData.get("sku") ?? "").trim();
	const location = String(formData.get("location") ?? "").trim();
	const status = String(formData.get("status") ?? "active").trim();
	const notes = String(formData.get("notes") ?? "").trim();
	const quantityRaw = String(formData.get("quantity") ?? "").trim();

	const fieldErrors: Record<string, string> = {};
	if (!id) fieldErrors.id = "Missing item id.";
	if (!name) fieldErrors.name = "Name is required.";
	if (!sku) fieldErrors.sku = "SKU is required.";
	if (!location) fieldErrors.location = "Location is required.";

	const quantity = parseQuantity(quantityRaw);
	if (quantity === null || quantity < 0) {
		fieldErrors.quantity = "Quantity must be 0 or more.";
	}

	if (Object.keys(fieldErrors).length > 0) {
		return buildErrorState(fieldErrors);
	}

	const nextStatus = quantity === 0 ? "sold_out" : status === "sold_out" ? "active" : status;

	const supabase = createSupabaseClient();
	const { error } = await supabase
		.from("inventory_items")
		.update({
			name,
			sku,
			location,
			status: nextStatus,
			notes: notes || null,
			quantity,
		})
		.eq("id", id);

	if (error) {
		return {
			ok: false,
			message: "Unable to update the item right now.",
			fieldErrors: {},
		};
	}

	return {
		ok: true,
		message: "Item updated.",
		fieldErrors: {},
	};
}

export async function deleteInventoryItem(
	_prevState: InventoryActionState,
	formData: FormData,
): Promise<InventoryActionState> {
	const id = String(formData.get("id") ?? "").trim();

	if (!id) {
		return buildErrorState({ id: "Missing item id." });
	}

	const supabase = createSupabaseClient();
	const { error } = await supabase.from("inventory_items").delete().eq("id", id);

	if (error) {
		return {
			ok: false,
			message: "Unable to delete the item right now.",
			fieldErrors: {},
		};
	}

	return {
		ok: true,
		message: "Item deleted.",
		fieldErrors: {},
	};
}
