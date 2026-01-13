import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	addForecastItem,
	deleteForecastItem,
	updateForecastItem,
} from "@/app/dashboard/forecast/actions";
import { initialForecastState } from "@/app/dashboard/forecast/form-state";
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
		updateEqMock,
		deleteEqMock,
	};
}

describe("forecast actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("validates missing forecast fields", async () => {
		const formData = new FormData();
		const result = await addForecastItem(initialForecastState, formData);

		expect(result.ok).toBe(false);
		expect(result.fieldErrors.projectName).toBeDefined();
		expect(result.fieldErrors.owner).toBeDefined();
		expect(result.fieldErrors.dueDate).toBeDefined();
	});

	it("adds forecast when fields are valid", async () => {
		const { insertMock } = buildSupabaseMocks();
		const formData = new FormData();
		formData.set("projectName", "Store rollout");
		formData.set("owner", "Ops Lead");
		formData.set("dueDate", "2026-01-20");
		formData.set("status", "planned");
		formData.set("risk", "low");

		const result = await addForecastItem(initialForecastState, formData);

		expect(result.ok).toBe(true);
		expect(insertMock).toHaveBeenCalled();
	});

	it("updates forecast entries by id", async () => {
		const { updateEqMock } = buildSupabaseMocks();
		const formData = new FormData();
		formData.set("id", "forecast_1");
		formData.set("projectName", "Update");
		formData.set("owner", "Lead");
		formData.set("dueDate", "2026-02-01");
		formData.set("status", "in_progress");
		formData.set("risk", "medium");

		const result = await updateForecastItem(initialForecastState, formData);

		expect(result.ok).toBe(true);
		expect(updateEqMock).toHaveBeenCalledWith("id", "forecast_1");
	});

	it("deletes forecast entries by id", async () => {
		const { deleteEqMock } = buildSupabaseMocks();
		const formData = new FormData();
		formData.set("id", "forecast_2");

		const result = await deleteForecastItem(initialForecastState, formData);

		expect(result.ok).toBe(true);
		expect(deleteEqMock).toHaveBeenCalledWith("id", "forecast_2");
	});
});
