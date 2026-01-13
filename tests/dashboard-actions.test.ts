import { auth } from "@clerk/nextjs/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteSubmission, submitIntake, updateSubmission } from "@/app/dashboard/actions";
import { initialActionState } from "@/app/dashboard/form-state";
import { createSupabaseClient } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
	createSupabaseClient: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
}));

const createSupabaseClientMock = vi.mocked(createSupabaseClient);
const authMock = vi.mocked(auth);

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
		fromMock,
		insertMock,
		updateMock,
		updateEqMock,
		deleteMock,
		deleteEqMock,
	};
}

describe("dashboard actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("validates missing intake fields", async () => {
		const formData = new FormData();
		const result = await submitIntake(initialActionState, formData);

		expect(result.ok).toBe(false);
		expect(result.fieldErrors.fullName).toBeDefined();
		expect(result.fieldErrors.workEmail).toBeDefined();
		expect(result.fieldErrors.company).toBeDefined();
		expect(result.fieldErrors.summary).toBeDefined();
	});

	it("rejects invalid numeric update fields", async () => {
		const { updateMock } = buildSupabaseMocks();
		const formData = new FormData();
		formData.set("id", "abc123");
		formData.set("page", "intake");
		formData.set("fields", "budget,summary");
		formData.set("numericFields", "budget");
		formData.set("budget", "not-a-number");
		formData.set("summary", "Test summary");

		const result = await updateSubmission(initialActionState, formData);

		expect(result.ok).toBe(false);
		expect(result.fieldErrors.budget).toBeDefined();
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("deletes a submission when id is present", async () => {
		const { deleteEqMock } = buildSupabaseMocks();
		const formData = new FormData();
		formData.set("id", "deadbeef");

		const result = await deleteSubmission(initialActionState, formData);

		expect(result.ok).toBe(true);
		expect(deleteEqMock).toHaveBeenCalledWith("id", "deadbeef");
	});

	it("submits intake when fields are valid", async () => {
		const { insertMock } = buildSupabaseMocks();
		authMock.mockResolvedValue({ userId: "user_123" } as never);

		const formData = new FormData();
		formData.set("fullName", "Alex Retail");
		formData.set("workEmail", "alex@example.com");
		formData.set("company", "Retail Co");
		formData.set("summary", "New supplier onboarding");
		formData.set("budget", "5000");

		const result = await submitIntake(initialActionState, formData);

		expect(result.ok).toBe(true);
		expect(insertMock).toHaveBeenCalled();
	});
});
