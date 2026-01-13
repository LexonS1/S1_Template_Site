"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import type { ActionState } from "./form-state";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildErrorState(fieldErrors: Record<string, string>): ActionState {
	return {
		ok: false,
		message: "Fix the highlighted fields and resubmit.",
		fieldErrors,
	};
}

async function insertSubmission({
	page,
	payload,
	userId,
}: {
	page: string;
	payload: Record<string, unknown>;
	userId?: string | null;
}): Promise<ActionState> {
	const supabase = createSupabaseClient();
	const { error } = await supabase.from("dashboard_submissions").insert({
		page,
		payload,
		user_id: userId ?? null,
	});

	if (error) {
		return {
			ok: false,
			message: "Unable to save right now. Please try again.",
			fieldErrors: {},
		};
	}

	return {
		ok: true,
		message: "Submission saved.",
		fieldErrors: {},
	};
}

export async function submitIntake(
	_prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const fullName = String(formData.get("fullName") ?? "").trim();
	const workEmail = String(formData.get("workEmail") ?? "").trim();
	const company = String(formData.get("company") ?? "").trim();
	const summary = String(formData.get("summary") ?? "").trim();
	const budgetRaw = String(formData.get("budget") ?? "").trim();

	const fieldErrors: Record<string, string> = {};

	if (!fullName) {
		fieldErrors.fullName = "Full name is required.";
	}
	if (!workEmail) {
		fieldErrors.workEmail = "Email is required.";
	} else if (!emailRegex.test(workEmail)) {
		fieldErrors.workEmail = "Enter a valid email.";
	}
	if (!company) {
		fieldErrors.company = "Company is required.";
	}
	if (!summary) {
		fieldErrors.summary = "Project summary is required.";
	}

	let budget: number | null = null;
	if (budgetRaw) {
		const parsedBudget = Number.parseFloat(budgetRaw);
		if (Number.isNaN(parsedBudget) || parsedBudget < 0) {
			fieldErrors.budget = "Budget must be a positive number.";
		} else {
			budget = parsedBudget;
		}
	}

	if (Object.keys(fieldErrors).length > 0) {
		return buildErrorState(fieldErrors);
	}

	const { userId } = await auth();
	return insertSubmission({
		page: "intake",
		payload: { fullName, workEmail, company, summary, budget },
		userId,
	});
}

export async function submitOpsRequest(
	_prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const team = String(formData.get("team") ?? "").trim();
	const priority = String(formData.get("priority") ?? "").trim();
	const dueDate = String(formData.get("dueDate") ?? "").trim();
	const request = String(formData.get("request") ?? "").trim();

	const fieldErrors: Record<string, string> = {};

	if (!team) {
		fieldErrors.team = "Team name is required.";
	}
	if (!priority) {
		fieldErrors.priority = "Select a priority.";
	}
	if (!dueDate) {
		fieldErrors.dueDate = "Add a due date.";
	}
	if (!request) {
		fieldErrors.request = "Request details are required.";
	}

	if (Object.keys(fieldErrors).length > 0) {
		return buildErrorState(fieldErrors);
	}

	const { userId } = await auth();
	return insertSubmission({
		page: "ops",
		payload: { team, priority, dueDate, request },
		userId,
	});
}

export async function submitRiskReview(
	_prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const area = String(formData.get("area") ?? "").trim();
	const level = String(formData.get("level") ?? "").trim();
	const impact = String(formData.get("impact") ?? "").trim();
	const mitigation = String(formData.get("mitigation") ?? "").trim();

	const fieldErrors: Record<string, string> = {};

	if (!area) {
		fieldErrors.area = "Risk area is required.";
	}
	if (!level) {
		fieldErrors.level = "Select a risk level.";
	}
	if (!impact) {
		fieldErrors.impact = "Impact summary is required.";
	}
	if (!mitigation) {
		fieldErrors.mitigation = "Add a mitigation plan.";
	}

	if (Object.keys(fieldErrors).length > 0) {
		return buildErrorState(fieldErrors);
	}

	const { userId } = await auth();
	return insertSubmission({
		page: "risk",
		payload: { area, level, impact, mitigation },
		userId,
	});
}

function parseNumberField(value: string) {
	const parsed = Number.parseFloat(value);
	if (Number.isNaN(parsed)) {
		return null;
	}
	return parsed;
}

export async function updateSubmission(
	_prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const id = String(formData.get("id") ?? "").trim();
	const page = String(formData.get("page") ?? "").trim();
	const fields = String(formData.get("fields") ?? "").trim();
	const numericFields = String(formData.get("numericFields") ?? "").trim();

	if (!id || !page || !fields) {
		return {
			ok: false,
			message: "Missing submission metadata.",
			fieldErrors: {},
		};
	}

	const fieldList = fields
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
	const numericList = new Set(
		numericFields
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean),
	);

	const payload: Record<string, unknown> = {};
	const fieldErrors: Record<string, string> = {};

	for (const field of fieldList) {
		const rawValue = String(formData.get(field) ?? "").trim();
		if (numericList.has(field)) {
			if (!rawValue) {
				payload[field] = null;
				continue;
			}
			const parsed = parseNumberField(rawValue);
			if (parsed === null) {
				fieldErrors[field] = "Enter a valid number.";
				continue;
			}
			payload[field] = parsed;
		} else {
			if (!rawValue) {
				fieldErrors[field] = "This field is required.";
			}
			payload[field] = rawValue;
		}
	}

	if (Object.keys(fieldErrors).length > 0) {
		return {
			ok: false,
			message: "Fix the highlighted fields and try again.",
			fieldErrors,
		};
	}

	const supabase = createSupabaseClient();
	const { error } = await supabase.from("dashboard_submissions").update({ payload }).eq("id", id);

	if (error) {
		return {
			ok: false,
			message: "Unable to update the submission.",
			fieldErrors: {},
		};
	}

	return {
		ok: true,
		message: "Submission updated.",
		fieldErrors: {},
	};
}

export async function deleteSubmission(
	_prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const id = String(formData.get("id") ?? "").trim();

	if (!id) {
		return {
			ok: false,
			message: "Missing submission id.",
			fieldErrors: {},
		};
	}

	const supabase = createSupabaseClient();
	const { error } = await supabase.from("dashboard_submissions").delete().eq("id", id);

	if (error) {
		return {
			ok: false,
			message: "Unable to delete the submission.",
			fieldErrors: {},
		};
	}

	return {
		ok: true,
		message: "Submission deleted.",
		fieldErrors: {},
	};
}
