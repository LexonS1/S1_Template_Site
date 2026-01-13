"use client";

import { useActionState, useEffect, useRef } from "react";
import {
	Button,
	Group,
	Paper,
	Select,
	Stack,
	Text,
	TextInput,
	Textarea,
} from "@mantine/core";
import { submitRiskReview } from "@/app/dashboard/actions";
import { initialActionState } from "@/app/dashboard/form-state";

const riskOptions = [
	{ value: "low", label: "Low - contained impact" },
	{ value: "moderate", label: "Moderate - manage closely" },
	{ value: "high", label: "High - leadership review" },
	{ value: "critical", label: "Critical - immediate action" },
];

export function RiskReviewForm() {
	const [state, formAction, isPending] = useActionState(
		submitRiskReview,
		initialActionState,
	);
	const formRef = useRef<HTMLFormElement | null>(null);

	useEffect(() => {
		if (state.ok) {
			formRef.current?.reset();
		}
	}, [state.ok]);

	return (
		<Paper withBorder radius="md" p="lg">
			<form action={formAction} ref={formRef}>
				<Stack gap="md">
					<TextInput
						label="Risk area"
						name="area"
						placeholder="Compliance, vendor delivery, staffing"
						error={state.fieldErrors.area}
						required
					/>
					<Select
						label="Risk level"
						name="level"
						placeholder="Select level"
						data={riskOptions}
						error={state.fieldErrors.level}
						required
					/>
					<Textarea
						label="Impact summary"
						name="impact"
						placeholder="What happens if this risk materializes?"
						minRows={3}
						error={state.fieldErrors.impact}
						required
					/>
					<Textarea
						label="Mitigation plan"
						name="mitigation"
						placeholder="Proposed actions, owners, and timing."
						minRows={3}
						error={state.fieldErrors.mitigation}
						required
					/>
					{state.message ? (
						<Text c={state.ok ? "teal" : "red"} size="sm">
							{state.message}
						</Text>
					) : null}
					<Group justify="flex-end">
						<Button type="submit" loading={isPending}>
							Log risk
						</Button>
					</Group>
				</Stack>
			</form>
		</Paper>
	);
}

