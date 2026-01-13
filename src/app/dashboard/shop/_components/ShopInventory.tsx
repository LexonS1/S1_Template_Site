"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Badge, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import { sellInventoryItem } from "../actions";
import { Pagination, SimpleGrid } from "@mantine/core";

type InventoryItem = {
	id: string;
	name: string;
	sku: string;
	quantity: number;
	status: string;
};

type ShopInventoryProps = {
	items: InventoryItem[];
};

type SellState = {
	ok: boolean;
	message: string;
	quantity?: number;
	status?: string;
};

const initialState: SellState = { ok: false, message: "" };
const pageSize = 9;

export function ShopInventory({ items }: ShopInventoryProps) {
	const [page, setPage] = useState(1);
	const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
	const pageItems = useMemo(() => {
		const start = (page - 1) * pageSize;
		return items.slice(start, start + pageSize);
	}, [items, page]);

	return (
		<Stack gap="md">
			{items.length === 0 ? (
				<Paper withBorder radius="md" p="md">
					<Text c="dimmed">No inventory items available.</Text>
				</Paper>
			) : null}
			<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
				{pageItems.map((item) => (
					<ShopRow key={item.id} item={item} />
				))}
			</SimpleGrid>
			{items.length > pageSize ? (
				<Group justify="center">
					<Pagination
						total={totalPages}
						value={page}
						onChange={setPage}
					/>
				</Group>
			) : null}
		</Stack>
	);
}

function ShopRow({ item }: { item: InventoryItem }) {
	const router = useRouter();
	const [state, action, isPending] = useActionState(
		sellInventoryItem,
		initialState,
	);
	const safeState = state ?? initialState;
	const [displayQty, setDisplayQty] = useState(item.quantity);
	const [displayStatus, setDisplayStatus] = useState(item.status);
	const [sellAmount, setSellAmount] = useState(1);
	const isSoldOut = displayQty <= 0;

	useEffect(() => {
		if (safeState.ok && typeof safeState.quantity === "number") {
			setDisplayQty(safeState.quantity);
			setDisplayStatus(safeState.status ?? displayStatus);
		}
	}, [safeState.ok, safeState.quantity, safeState.status, displayStatus]);

	useEffect(() => {
		setDisplayQty(item.quantity);
		setDisplayStatus(item.status);
	}, [item.quantity, item.status]);

	return (
		<Paper withBorder radius="lg" p="lg" style={{ minHeight: 240 }}>
			<Stack gap="sm" style={{ height: "100%" }}>
				<Group justify="space-between">
					<Stack gap={2}>
						<Title order={4}>{item.name}</Title>
						<Text size="sm" c="dimmed">
							SKU {item.sku}
						</Text>
					</Stack>
					<Badge color={isSoldOut ? "red" : "blue"} variant="light">
						{isSoldOut ? "Sold out" : `Qty ${displayQty}`}
					</Badge>
				</Group>
				<form action={action}>
					<input type="hidden" name="id" value={item.id} />
					{!isSoldOut ? (
						<input type="hidden" name="amount" value={sellAmount} />
					) : null}
					<Group justify="space-between" align="flex-start">
						<Text
							size="sm"
							c={safeState.message ? (safeState.ok ? "teal" : "red") : "dimmed"}
							style={{ minHeight: 20 }}
						>
							{safeState.message ?? "Record a sale to decrement stock."}
						</Text>
						<Group>
							{!isSoldOut ? (
								<input
									type="number"
									min={1}
									max={displayQty}
									value={sellAmount}
									onChange={(event) => {
										const nextValue = Number.parseInt(event.target.value, 10);
										if (Number.isNaN(nextValue)) {
											setSellAmount(1);
										} else {
											setSellAmount(Math.max(1, nextValue));
										}
									}}
									style={{
										width: 80,
										backgroundColor: "rgba(255,255,255,0.06)",
										border: "1px solid rgba(255,255,255,0.12)",
										borderRadius: 6,
										color: "inherit",
										padding: "6px 8px",
									}}
								/>
							) : null}
							<Button type="submit" loading={isPending} disabled={isSoldOut}>
								Sell
							</Button>
						</Group>
					</Group>
				</form>
			</Stack>
		</Paper>
	);
}
