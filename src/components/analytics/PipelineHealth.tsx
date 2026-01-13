import { Box, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";

type StatusItem = {
	label: string;
	value: number;
	color: string;
};

type PipelineHealthProps = {
	items: StatusItem[];
};

export function PipelineHealth({ items }: PipelineHealthProps) {
	return (
		<Paper withBorder radius="md" p="lg">
			<Stack gap="sm">
				<Group justify="space-between">
					<Title order={3}>Pipeline health</Title>
					<Text size="sm" c="dimmed">
						Current delivery mix
					</Text>
				</Group>
				<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
					{items.map((item) => (
						<Paper key={item.label} withBorder radius="md" p="md">
							<Stack gap={6}>
								<Group justify="space-between">
									<Text size="sm" c="dimmed">
										{item.label}
									</Text>
									<Text fw={600}>{item.value}%</Text>
								</Group>
								<Box
									style={{
										height: 6,
										borderRadius: 999,
										backgroundColor: "rgba(255,255,255,0.08)",
									}}
								>
									<Box
										style={{
											height: "100%",
											width: `${item.value}%`,
											borderRadius: 999,
											backgroundColor: item.color,
										}}
									/>
								</Box>
							</Stack>
						</Paper>
					))}
				</SimpleGrid>
			</Stack>
		</Paper>
	);
}
