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
import {
	addForecastItem,
	deleteForecastItem,
	updateForecastItem,
} from "@/app/dashboard/forecast/actions";
import { initialForecastState } from "@/app/dashboard/forecast/form-state";

type ForecastItem = {
	id: string;
	created_at: string;
	project_name: string;
	owner: string;
	due_date: string;
	status: string;
	risk: string;
	notes: string | null;
};

const statusOptions = [
	{ value: "planned", label: "Planned" },
	{ value: "in_progress", label: "In progress" },
	{ value: "at_risk", label: "At risk" },
	{ value: "delivered", label: "Delivered" },
];

const riskOptions = [
	{ value: "low", label: "Low" },
	{ value: "medium", label: "Medium" },
	{ value: "high", label: "High" },
];

type ForecastManagerProps = {
	items: ForecastItem[];
};

export function ForecastManager({ items }: ForecastManagerProps) {
	const router = useRouter();
	const [showAddForm, setShowAddForm] = useState(false);
	const [addState, addAction, addPending] = useActionState(addForecastItem, initialForecastState);
	const safeAddState = addState ?? initialForecastState;
	const addFieldErrors = safeAddState.fieldErrors ?? {};
	const addFormRef = useRef<HTMLFormElement | null>(null);

	useEffect(() => {
		if (safeAddState.ok) {
			addFormRef.current?.reset();
			setShowAddForm(false);
			router.refresh();
		}
	}, [safeAddState.ok, router]);

	return (
		<Stack gap="xl">
			<Group justify="space-between">
				<Title order={3}>Delivery forecast</Title>
				<Button onClick={() => setShowAddForm((prev) => !prev)}>
					{showAddForm ? "Hide form" : "Add forecast"}
				</Button>
			</Group>
			{showAddForm ? (
				<Paper withBorder radius="lg" p="lg">
					<Stack gap="md">
						<Group justify="space-between">
							<Title order={3}>Add forecast item</Title>
							{safeAddState.message ? (
								<Text c={safeAddState.ok ? "teal" : "red"} size="sm">
									{safeAddState.message}
								</Text>
							) : null}
						</Group>
						<form action={addAction} ref={addFormRef}>
							<Stack gap="md">
								<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
									<TextInput
										label="Project"
										name="projectName"
										placeholder="Edge rollout wave 3"
										error={addFieldErrors.projectName}
										required
									/>
									<TextInput
										label="Owner"
										name="owner"
										placeholder="Delivery lead"
										error={addFieldErrors.owner}
										required
									/>
									<TextInput
										label="Due date"
										name="dueDate"
										type="date"
										error={addFieldErrors.dueDate}
										required
									/>
									<Select
										label="Status"
										name="status"
										data={statusOptions}
										defaultValue="planned"
										allowDeselect={false}
									/>
									<Select
										label="Risk"
										name="risk"
										data={riskOptions}
										defaultValue="low"
										allowDeselect={false}
									/>
								</SimpleGrid>
								<Textarea
									label="Notes"
									name="notes"
									placeholder="Dependencies, blockers, or delivery notes."
									minRows={3}
								/>
								<Group justify="flex-end">
									<Button type="submit" loading={addPending}>
										Add forecast
									</Button>
								</Group>
							</Stack>
						</form>
					</Stack>
				</Paper>
			) : null}

			<Stack gap="md">
				<Text size="sm" c="dimmed">
					{items.length} items
				</Text>
				{items.length === 0 ? (
					<Paper withBorder radius="md" p="md">
						<Text c="dimmed">No forecast items yet.</Text>
					</Paper>
				) : null}
				{items.map((item) => (
					<ForecastRow key={item.id} item={item} />
				))}
			</Stack>
		</Stack>
	);
}

function ForecastRow({ item }: { item: ForecastItem }) {
	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);
	const [updateState, updateAction, updatePending] = useActionState(
		updateForecastItem,
		initialForecastState,
	);
	const [deleteState, deleteAction, deletePending] = useActionState(
		deleteForecastItem,
		initialForecastState,
	);
	const safeUpdateState = updateState ?? initialForecastState;
	const safeDeleteState = deleteState ?? initialForecastState;
	const updateFieldErrors = safeUpdateState.fieldErrors ?? {};
	const updateRef = useRef<HTMLFormElement | null>(null);

	useEffect(() => {
		if (safeUpdateState.ok || safeDeleteState.ok) {
			router.refresh();
		}
	}, [safeUpdateState.ok, safeDeleteState.ok, router]);

	return (
		<Paper withBorder radius="lg" p="lg">
			<Stack gap="md">
				<Group justify="space-between" align="flex-start">
					<Stack gap={4}>
						<Group gap="xs">
							<Title order={4}>{item.project_name}</Title>
							<Badge variant="light">{item.status.replace("_", " ")}</Badge>
							<Badge variant="light" color="orange">
								{item.risk}
							</Badge>
						</Group>
						<Text size="sm" c="dimmed">
							Owner {item.owner} | Due {item.due_date}
						</Text>
					</Stack>
					<Stack gap={4} align="flex-end">
						<Text size="xs" c="dimmed">
							ID {item.id.slice(0, 8)}
						</Text>
						<Button variant="light" size="xs" onClick={() => setIsEditing((prev) => !prev)}>
							{isEditing ? "Hide edit" : "Edit"}
						</Button>
					</Stack>
				</Group>

				{isEditing ? (
					<Stack gap="md">
						<form action={updateAction} ref={updateRef}>
							<input type="hidden" name="id" value={item.id} />
							<Stack gap="md">
								<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
									<TextInput
										label="Project"
										name="projectName"
										defaultValue={item.project_name}
										error={updateFieldErrors.projectName}
										required
									/>
									<TextInput
										label="Owner"
										name="owner"
										defaultValue={item.owner}
										error={updateFieldErrors.owner}
										required
									/>
									<TextInput
										label="Due date"
										name="dueDate"
										type="date"
										defaultValue={item.due_date}
										error={updateFieldErrors.dueDate}
										required
									/>
									<Select
										label="Status"
										name="status"
										data={statusOptions}
										defaultValue={item.status}
										allowDeselect={false}
									/>
									<Select
										label="Risk"
										name="risk"
										data={riskOptions}
										defaultValue={item.risk}
										allowDeselect={false}
									/>
								</SimpleGrid>
								<Textarea label="Notes" name="notes" defaultValue={item.notes ?? ""} minRows={3} />
								<Group justify="space-between" align="flex-start">
									<Text c={safeUpdateState.ok ? "teal" : "red"} size="sm" style={{ minHeight: 20 }}>
										{safeUpdateState.message ?? ""}
									</Text>
									<Group>
										<Button
											variant="default"
											onClick={() => {
												updateRef.current?.reset();
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
							</Stack>
						</form>
						<form action={deleteAction}>
							<input type="hidden" name="id" value={item.id} />
							<Group justify="flex-end">
								<Button type="submit" color="red" variant="light" loading={deletePending}>
									Delete item
								</Button>
							</Group>
						</form>
						{safeDeleteState.message ? (
							<Text c={safeDeleteState.ok ? "teal" : "red"} size="sm">
								{safeDeleteState.message}
							</Text>
						) : null}
					</Stack>
				) : null}
			</Stack>
		</Paper>
	);
}
