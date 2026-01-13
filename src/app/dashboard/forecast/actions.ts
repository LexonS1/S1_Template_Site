"use server";

import { createSupabaseClient } from "@/lib/supabase";
import type { ForecastActionState } from "./form-state";

function buildErrorState(
	fieldErrors: Record<string, string>,
): ForecastActionState {
	return {
		ok: false,
		message: "Fix the highlighted fields and try again.",
		fieldErrors,
	};
}

export async function addForecastItem(
	_prevState: ForecastActionState,
	formData: FormData,
): Promise<ForecastActionState> {
	const projectName = String(formData.get("projectName") ?? "").trim();
	const owner = String(formData.get("owner") ?? "").trim();
	const dueDate = String(formData.get("dueDate") ?? "").trim();
	const status = String(formData.get("status") ?? "planned").trim();
	const risk = String(formData.get("risk") ?? "low").trim();
	const notes = String(formData.get("notes") ?? "").trim();

	const fieldErrors: Record<string, string> = {};
	if (!projectName) fieldErrors.projectName = "Project name is required.";
	if (!owner) fieldErrors.owner = "Owner is required.";
	if (!dueDate) fieldErrors.dueDate = "Due date is required.";

	if (Object.keys(fieldErrors).length > 0) {
		return buildErrorState(fieldErrors);
	}

	const supabase = createSupabaseClient();
	const { error } = await supabase.from("delivery_forecast").insert({
		project_name: projectName,
		owner,
		due_date: dueDate,
		status,
		risk,
		notes: notes || null,
	});

	if (error) {
		return {
			ok: false,
			message: "Unable to save the forecast item.",
			fieldErrors: {},
		};
	}

	return {
		ok: true,
		message: "Forecast item added.",
		fieldErrors: {},
	};
}

export async function updateForecastItem(
	_prevState: ForecastActionState,
	formData: FormData,
): Promise<ForecastActionState> {
	const id = String(formData.get("id") ?? "").trim();
	const projectName = String(formData.get("projectName") ?? "").trim();
	const owner = String(formData.get("owner") ?? "").trim();
	const dueDate = String(formData.get("dueDate") ?? "").trim();
	const status = String(formData.get("status") ?? "planned").trim();
	const risk = String(formData.get("risk") ?? "low").trim();
	const notes = String(formData.get("notes") ?? "").trim();

	const fieldErrors: Record<string, string> = {};
	if (!id) fieldErrors.id = "Missing id.";
	if (!projectName) fieldErrors.projectName = "Project name is required.";
	if (!owner) fieldErrors.owner = "Owner is required.";
	if (!dueDate) fieldErrors.dueDate = "Due date is required.";

	if (Object.keys(fieldErrors).length > 0) {
		return buildErrorState(fieldErrors);
	}

	const supabase = createSupabaseClient();
	const { error } = await supabase
		.from("delivery_forecast")
		.update({
			project_name: projectName,
			owner,
			due_date: dueDate,
			status,
			risk,
			notes: notes || null,
		})
		.eq("id", id);

	if (error) {
		return {
			ok: false,
			message: "Unable to update the forecast item.",
			fieldErrors: {},
		};
	}

	return {
		ok: true,
		message: "Forecast item updated.",
		fieldErrors: {},
	};
}

export async function deleteForecastItem(
	_prevState: ForecastActionState,
	formData: FormData,
): Promise<ForecastActionState> {
	const id = String(formData.get("id") ?? "").trim();

	if (!id) {
		return buildErrorState({ id: "Missing id." });
	}

	const supabase = createSupabaseClient();
	const { error } = await supabase.from("delivery_forecast").delete().eq("id", id);

	if (error) {
		return {
			ok: false,
			message: "Unable to delete the forecast item.",
			fieldErrors: {},
		};
	}

	return {
		ok: true,
		message: "Forecast item deleted.",
		fieldErrors: {},
	};
}
