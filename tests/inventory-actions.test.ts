import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	addInventoryItem,
	deleteInventoryItem,
	updateInventoryItem,
} from "@/app/dashboard/inventory/actions";
import { initialInventoryState } from "@/app/dashboard/inventory/form-state";
import { createSupabaseClient } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
	createSupabaseClient: vi.fn(),
}));

const createSupabaseClientMock = vi.mocked(createSupabaseClient);

function buildSupabaseMocks() {
	const insertMock = vi.fn().mockResolvedValue({ error: null });
	const updateEqMock = vi.fn().mockResolvedValue({ error: null });
	const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock });
	const deleteEqMock = vi.fn().mockResolvedValue({ error: null });
	const deleteMock = vi.fn().mockReturnValue({ eq: deleteEqMock });
	const fromMock = vi.fn(() => ({
		insert: insertMock,
		update: updateMock,
		delete: deleteMock,
	}));

	createSupabaseClientMock.mockReturnValue({ from: fromMock } as never);

	return {
		insertMock,
		updateMock,
		updateEqMock,
		deleteMock,
		deleteEqMock,
	};
}

describe("inventory actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects invalid inventory add payloads", async () => {
		const formData = new FormData();
		const result = await addInventoryItem(initialInventoryState, formData);

		expect(result.ok).toBe(false);
		expect(result.fieldErrors.name).toBeDefined();
		expect(result.fieldErrors.sku).toBeDefined();
		expect(result.fieldErrors.location).toBeDefined();
	});

	it("marks new items sold_out when quantity is 0", async () => {
		const { insertMock } = buildSupabaseMocks();
		const formData = new FormData();
		formData.set("name", "Test item");
		formData.set("sku", "SKU-1");
		formData.set("location", "A1");
		formData.set("status", "active");
		formData.set("quantity", "0");

		const result = await addInventoryItem(initialInventoryState, formData);

		expect(result.ok).toBe(true);
		expect(insertMock).toHaveBeenCalledWith(
			expect.objectContaining({ status: "sold_out", quantity: 0 }),
		);
	});

	it("updates inventory items and clears sold_out when qty > 0", async () => {
		const { updateEqMock } = buildSupabaseMocks();
		const formData = new FormData();
		formData.set("id", "item_1");
		formData.set("name", "Updated");
		formData.set("sku", "SKU-2");
		formData.set("location", "B1");
		formData.set("status", "sold_out");
		formData.set("quantity", "5");

		const result = await updateInventoryItem(initialInventoryState, formData);

		expect(result.ok).toBe(true);
		expect(updateEqMock).toHaveBeenCalledWith("id", "item_1");
	});

	it("deletes inventory items when id provided", async () => {
		const { deleteEqMock } = buildSupabaseMocks();
		const formData = new FormData();
		formData.set("id", "item_2");

		const result = await deleteInventoryItem(initialInventoryState, formData);

		expect(result.ok).toBe(true);
		expect(deleteEqMock).toHaveBeenCalledWith("id", "item_2");
	});
});
