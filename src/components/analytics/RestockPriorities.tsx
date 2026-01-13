import { Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";

type RestockItem = {
	id: string;
	name: string;
	quantity: number;
};

type RestockPrioritiesProps = {
	items: RestockItem[];
};

export function RestockPriorities({ items }: RestockPrioritiesProps) {
	return (
		<Paper withBorder radius="md" p="lg">
			<Stack gap="sm">
				<Group justify="space-between">
					<Title order={3}>Restock priorities</Title>
					<Text size="sm" c="dimmed">
						Top 3 items needing restock
					</Text>
				</Group>
				{items.length === 0 ? (
					<Text size="sm" c="dimmed">
						No low-stock items right now.
					</Text>
				) : (
					<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
						{items.map((item) => (
							<Paper key={item.id} withBorder radius="md" p="md">
								<Stack gap={6}>
									<Text fw={600}>{item.name}</Text>
									<Text size="sm" c="dimmed">
										Qty {item.quantity}
									</Text>
								</Stack>
							</Paper>
						))}
					</SimpleGrid>
				)}
			</Stack>
		</Paper>
	);
}
