import { beforeEach, describe, expect, it, vi } from "vitest";
import { sellInventoryItem } from "@/app/dashboard/shop/actions";
import { createSupabaseClient } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
	createSupabaseClient: vi.fn(),
}));

const createSupabaseClientMock = vi.mocked(createSupabaseClient);

function buildSupabaseMocks({
	quantity = 5,
	status = "active",
}: {
	quantity?: number;
	status?: string;
} = {}) {
	const selectSingleMock = vi.fn().mockResolvedValue({
		error: null,
		data: { quantity, status },
	});
	const selectMock = vi.fn().mockReturnValue({ eq: () => ({ single: selectSingleMock }) });
	const updateEqMock = vi.fn().mockResolvedValue({ error: null });
	const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock });
	const insertMock = vi.fn().mockResolvedValue({ error: null });

	const fromMock = vi.fn((table: string) => {
		if (table === "inventory_items") {
			return { select: selectMock, update: updateMock };
		}
		if (table === "inventory_sales") {
			return { insert: insertMock };
		}
		return {};
	});

	createSupabaseClientMock.mockReturnValue({ from: fromMock } as never);

	return {
		selectSingleMock,
		updateEqMock,
		insertMock,
	};
}

describe("shop actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects invalid amount", async () => {
		buildSupabaseMocks();
		const formData = new FormData();
		formData.set("id", "item_1");
		formData.set("amount", "0");

		const result = await sellInventoryItem({ ok: false, message: "" }, formData);

		expect(result.ok).toBe(false);
	});

	it("records a sale and decrements quantity", async () => {
		const { updateEqMock, insertMock } = buildSupabaseMocks({ quantity: 5 });
		const formData = new FormData();
		formData.set("id", "item_2");
		formData.set("amount", "2");

		const result = await sellInventoryItem({ ok: false, message: "" }, formData);

		expect(result.ok).toBe(true);
		expect(updateEqMock).toHaveBeenCalledWith("id", "item_2");
		expect(insertMock).toHaveBeenCalledWith(
			expect.objectContaining({ item_id: "item_2", quantity: 2 }),
		);
	});

	it("prevents selling sold-out items", async () => {
		buildSupabaseMocks({ quantity: 0, status: "sold_out" });
		const formData = new FormData();
		formData.set("id", "item_3");
		formData.set("amount", "1");

		const result = await sellInventoryItem({ ok: false, message: "" }, formData);

		expect(result.ok).toBe(false);
		expect(result.message).toMatch(/sold out/i);
	});
});
