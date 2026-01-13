"use client";

import {
	Badge,
	Button,
	Group,
	Paper,
	Select,
	SimpleGrid,
	Stack,
	Text,
	Textarea,
	TextInput,
	Title,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { deleteSubmission, updateSubmission } from "@/app/dashboard/actions";
import { initialActionState } from "@/app/dashboard/form-state";

export type SubmissionField = {
	name: string;
	label: string;
	type?: "text" | "email" | "number" | "date" | "textarea" | "select";
	options?: { value: string; label: string }[];
};

type SubmissionRow = {
	id: string;
	created_at: string;
	payload: Record<string, unknown>;
};

type SubmissionLogClientProps = {
	page: string;
	title: string;
	fields: SubmissionField[];
	entries: SubmissionRow[];
};

function formatValue(value: unknown) {
	if (value === null || value === undefined) {
		return "--";
	}
	if (typeof value === "string") {
		return value;
	}
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}
	return JSON.stringify(value);
}

export function SubmissionLogClient({ page, title, fields, entries }: SubmissionLogClientProps) {
	return (
		<Paper withBorder radius="md" p="lg">
			<Stack gap="md">
				<Group justify="space-between">
					<Title order={3}>{title}</Title>
					<Text size="sm" c="dimmed">
						Last 20 submissions
					</Text>
				</Group>
				{entries.length === 0 ? (
					<Text c="dimmed" size="sm">
						No submissions yet.
					</Text>
				) : null}
				{entries.map((entry, index) => (
					<SubmissionEntry
						key={entry.id}
						page={page}
						entry={entry}
						fields={fields}
						entryNumber={entries.length - index}
					/>
				))}
			</Stack>
		</Paper>
	);
}

function SubmissionEntry({
	page,
	entry,
	fields,
	entryNumber,
}: {
	page: string;
	entry: SubmissionRow;
	fields: SubmissionField[];
	entryNumber: number;
}) {
	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);
	const [updateState, updateAction, updatePending] = useActionState(
		updateSubmission,
		initialActionState,
	);
	const [deleteState, deleteAction, deletePending] = useActionState(
		deleteSubmission,
		initialActionState,
	);
	const safeUpdateState = updateState ?? initialActionState;
	const safeDeleteState = deleteState ?? initialActionState;
	const updateFieldErrors = safeUpdateState.fieldErrors ?? {};
	const formRef = useRef<HTMLFormElement | null>(null);

	useEffect(() => {
		if (safeUpdateState.ok || safeDeleteState.ok) {
			setIsEditing(false);
			router.refresh();
		}
	}, [safeUpdateState.ok, safeDeleteState.ok, router]);

	const fieldsCsv = fields.map((field) => field.name).join(",");
	const numericFieldsCsv = fields
		.filter((field) => field.type === "number")
		.map((field) => field.name)
		.join(",");

	return (
		<Paper key={entry.id} withBorder radius="md" p="md">
			<Stack gap="sm">
				<Group justify="space-between">
					<Group gap="xs">
						<Badge variant="light">Entry {entryNumber}</Badge>
						<Text size="sm" fw={600}>
							{new Date(entry.created_at).toLocaleString()}
						</Text>
					</Group>
					<Group gap="xs">
						<Text size="xs" c="dimmed">
							ID {entry.id.slice(0, 8)}
						</Text>
						<Button size="xs" variant="light" onClick={() => setIsEditing((prev) => !prev)}>
							{isEditing ? "Hide edit" : "Edit"}
						</Button>
					</Group>
				</Group>

				{isEditing ? (
					<Stack gap="md">
						<form action={updateAction} ref={formRef}>
							<input type="hidden" name="id" value={entry.id} />
							<input type="hidden" name="page" value={page} />
							<input type="hidden" name="fields" value={fieldsCsv} />
							<input type="hidden" name="numericFields" value={numericFieldsCsv} />
							<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
								{fields.map((field) => {
									const value = entry.payload[field.name];
									if (field.type === "textarea") {
										return (
											<Textarea
												key={field.name}
												label={field.label}
												name={field.name}
												defaultValue={String(value ?? "")}
												minRows={3}
												error={updateFieldErrors[field.name]}
												required
											/>
										);
									}
									if (field.type === "select" && field.options) {
										return (
											<Select
												key={field.name}
												label={field.label}
												name={field.name}
												data={field.options}
												defaultValue={String(value ?? "")}
												allowDeselect={false}
												error={updateFieldErrors[field.name]}
												required
											/>
										);
									}
									return (
										<TextInput
											key={field.name}
											label={field.label}
											name={field.name}
											type={field.type === "number" ? "number" : field.type}
											defaultValue={String(value ?? "")}
											error={updateFieldErrors[field.name]}
											required
										/>
									);
								})}
							</SimpleGrid>
							<Group justify="space-between" align="flex-start" mt="md">
								<Text c={safeUpdateState.ok ? "teal" : "red"} size="sm" style={{ minHeight: 20 }}>
									{safeUpdateState.message ?? ""}
								</Text>
								<Group>
									<Button
										variant="default"
										onClick={() => {
											formRef.current?.reset();
											setIsEditing(false);
										}}
									>
										Cancel
									</Button>
									<Button type="submit" loading={updatePending}>
										Save changes
									</Button>
								</Group>
							</Group>
						</form>
						<form action={deleteAction}>
							<input type="hidden" name="id" value={entry.id} />
							<Group justify="flex-end">
								<Button type="submit" color="red" variant="light" loading={deletePending}>
									Delete entry
								</Button>
							</Group>
						</form>
						{safeDeleteState.message ? (
							<Text c={safeDeleteState.ok ? "teal" : "red"} size="sm">
								{safeDeleteState.message}
							</Text>
						) : null}
					</Stack>
				) : (
					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
						{fields.map((field) => (
							<Stack key={field.name} gap={2}>
								<Text size="xs" c="dimmed">
									{field.label}
								</Text>
								<Text size="sm">{formatValue(entry.payload[field.name])}</Text>
							</Stack>
						))}
					</SimpleGrid>
				)}
			</Stack>
		</Paper>
	);
}
