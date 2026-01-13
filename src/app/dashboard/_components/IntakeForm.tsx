"use client";

import { useActionState, useEffect, useRef } from "react";
import {
	Button,
	Group,
	Paper,
	Stack,
	Text,
	TextInput,
	Textarea,
} from "@mantine/core";
import { submitIntake } from "../actions";
import { initialActionState } from "../form-state";

export function IntakeForm() {
	const [state, formAction, isPending] = useActionState(
		submitIntake,
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
						label="Full name"
						name="fullName"
						placeholder="Jordan Rivera"
						error={state.fieldErrors.fullName}
						required
					/>
					<TextInput
						label="Work email"
						name="workEmail"
						type="email"
						placeholder="jordan@company.com"
						error={state.fieldErrors.workEmail}
						required
					/>
					<TextInput
						label="Company"
						name="company"
						placeholder="Juniper Labs"
						error={state.fieldErrors.company}
						required
					/>
					<Textarea
						label="Project summary"
						name="summary"
						placeholder="Outline the outcomes, deadlines, and constraints."
						minRows={4}
						error={state.fieldErrors.summary}
						required
					/>
					<TextInput
						label="Estimated budget (USD)"
						name="budget"
						type="number"
						placeholder="50000"
						error={state.fieldErrors.budget}
						inputMode="decimal"
					/>
					{state.message ? (
						<Text c={state.ok ? "teal" : "red"} size="sm">
							{state.message}
						</Text>
					) : null}
					<Group justify="flex-end">
						<Button type="submit" loading={isPending}>
							Save intake
						</Button>
					</Group>
				</Stack>
			</form>
		</Paper>
	);
}
