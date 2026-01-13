"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
	Badge,
	Button,
	Group,
	Paper,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Textarea,
	Title,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import {
	addInventoryItem,
	deleteInventoryItem,
	updateInventoryItem,
} from "../actions";
import { initialInventoryState } from "../form-state";

type InventoryItem = {
	id: string;
	created_at: string;
	name: string;
	sku: string;
	quantity: number;
	location: string;
	status: string;
	notes: string | null;
};

const statusOptions = [
	{ value: "active", label: "Active" },
	{ value: "backorder", label: "Backorder" },
	{ value: "sold_out", label: "Sold out" },
	{ value: "retired", label: "Retired" },
];

type InventoryManagerProps = {
	items: InventoryItem[];
};

export function InventoryManager({ items }: InventoryManagerProps) {
	const router = useRouter();
	const [showAddForm, setShowAddForm] = useState(false);
	const [addState, addAction, addPending] = useActionState(
		addInventoryItem,
		initialInventoryState,
	);
	const safeAddState = addState ?? initialInventoryState;
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
			<Group justify="space-between" mt="md">
				<Title order={3}>Inventory list</Title>
				<Button onClick={() => setShowAddForm((prev) => !prev)}>
					{showAddForm ? "Hide form" : "Add item"}
				</Button>
			</Group>
			{showAddForm ? (
				<Paper withBorder radius="lg" p="lg">
					<Stack gap="md">
						<Group justify="space-between">
							<Title order={3}>Add inventory item</Title>
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
										label="Item name"
										name="name"
										placeholder="Dispatch tablets"
										error={addFieldErrors.name}
										required
									/>
									<TextInput
										label="SKU"
										name="sku"
										placeholder="TAB-402"
										error={addFieldErrors.sku}
										required
									/>
									<TextInput
										label="Quantity"
										name="quantity"
										type="number"
										placeholder="20"
										error={addFieldErrors.quantity}
										required
									/>
									<TextInput
										label="Location"
										name="location"
										placeholder="HQ - Bay 3"
										error={addFieldErrors.location}
										required
									/>
									<Select
										label="Status"
										name="status"
										data={statusOptions}
										defaultValue="active"
										allowDeselect={false}
									/>
								</SimpleGrid>
								<Textarea
									label="Notes"
									name="notes"
									placeholder="Condition, deployment notes, or special handling."
									minRows={3}
								/>
								<Group justify="flex-end">
									<Button type="submit" loading={addPending}>
										Add item
									</Button>
								</Group>
							</Stack>
						</form>
					</Stack>
				</Paper>
			) : null}

			<Stack gap="md">
				<Group justify="space-between">
					<Text size="sm" c="dimmed">
						{items.length} items
					</Text>
				</Group>
				{items.length === 0 ? (
					<Paper withBorder radius="md" p="md">
						<Text c="dimmed">No inventory items yet.</Text>
					</Paper>
				) : null}
				{items.map((item) => (
					<InventoryRow key={item.id} item={item} />
				))}
			</Stack>
		</Stack>
	);
}

function InventoryRow({ item }: { item: InventoryItem }) {
	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);
	const [updateState, updateAction, updatePending] = useActionState(
		updateInventoryItem,
		initialInventoryState,
	);
	const [deleteState, deleteAction, deletePending] = useActionState(
		deleteInventoryItem,
		initialInventoryState,
	);
	const safeUpdateState = updateState ?? initialInventoryState;
	const safeDeleteState = deleteState ?? initialInventoryState;
	const updateFieldErrors = safeUpdateState.fieldErrors ?? {};
	const updateRef = useRef<HTMLFormElement | null>(null);

	useEffect(() => {
		if (safeUpdateState.ok || safeDeleteState.ok) {
			router.refresh();
		}
	}, [safeUpdateState.ok, safeDeleteState.ok, router]);

	const effectiveStatus =
		item.quantity <= 0 ? "sold_out" : item.status === "sold_out" ? "active" : item.status;

	return (
		<Paper withBorder radius="lg" p="lg">
			<Stack gap="md">
				<Group justify="space-between" align="flex-start">
					<Stack gap={4}>
						<Group gap="xs">
							<Title order={4}>{item.name}</Title>
							<Badge variant="light">{effectiveStatus}</Badge>
						</Group>
						<Text size="sm" c="dimmed">
							SKU {item.sku} · Qty {item.quantity}
						</Text>
					</Stack>
					<Stack gap={4} align="flex-end">
						<Text size="xs" c="dimmed">
							ID {item.id.slice(0, 8)}
						</Text>
						<Button
							variant="light"
							size="xs"
							onClick={() => setIsEditing((prev) => !prev)}
						>
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
										label="Item name"
										name="name"
										defaultValue={item.name}
										error={updateFieldErrors.name}
										required
									/>
									<TextInput
										label="SKU"
										name="sku"
										defaultValue={item.sku}
										error={updateFieldErrors.sku}
										required
									/>
									<TextInput
										label="Quantity"
										name="quantity"
										type="number"
										defaultValue={item.quantity}
										error={updateFieldErrors.quantity}
										required
									/>
									<TextInput
										label="Location"
										name="location"
										defaultValue={item.location}
										error={updateFieldErrors.location}
										required
									/>
									<Select
										label="Status"
										name="status"
										data={statusOptions}
										defaultValue={effectiveStatus}
										allowDeselect={false}
									/>
								</SimpleGrid>
								<Textarea
									label="Notes"
									name="notes"
									defaultValue={item.notes ?? ""}
									minRows={3}
								/>
								<Group justify="space-between" align="flex-start">
									<Text
										c={safeUpdateState.ok ? "teal" : "red"}
										size="sm"
										style={{ minHeight: 20 }}
									>
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
								<Button
									type="submit"
									color="red"
									variant="light"
									loading={deletePending}
								>
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
