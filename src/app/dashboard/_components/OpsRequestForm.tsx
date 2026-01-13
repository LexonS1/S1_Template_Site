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
import { submitOpsRequest } from "../actions";
import { initialActionState } from "../form-state";

const priorityOptions = [
	{ value: "low", label: "Low - next sprint" },
	{ value: "medium", label: "Medium - this week" },
	{ value: "high", label: "High - within 48 hours" },
	{ value: "urgent", label: "Urgent - today" },
];

export function OpsRequestForm() {
	const [state, formAction, isPending] = useActionState(
		submitOpsRequest,
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
						label="Team name"
						name="team"
						placeholder="Growth Ops"
						error={state.fieldErrors.team}
						required
					/>
					<Select
						label="Priority"
						name="priority"
						placeholder="Pick one"
						data={priorityOptions}
						error={state.fieldErrors.priority}
						required
					/>
					<TextInput
						label="Due date"
						name="dueDate"
						type="date"
						error={state.fieldErrors.dueDate}
						required
					/>
					<Textarea
						label="Request details"
						name="request"
						placeholder="Describe the work, stakeholders, and expected outcomes."
						minRows={4}
						error={state.fieldErrors.request}
						required
					/>
					{state.message ? (
						<Text c={state.ok ? "teal" : "red"} size="sm">
							{state.message}
						</Text>
					) : null}
					<Group justify="flex-end">
						<Button type="submit" loading={isPending}>
							Submit request
						</Button>
					</Group>
				</Stack>
			</form>
		</Paper>
	);
}
