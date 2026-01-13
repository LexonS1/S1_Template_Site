import { Paper, SimpleGrid, Stack, Text } from "@mantine/core";

type Metric = {
	label: string;
	value: string;
	note: string;
};

type MetricsCardsProps = {
	metrics: Metric[];
};

export function MetricsCards({ metrics }: MetricsCardsProps) {
	return (
		<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
			{metrics.map((metric) => (
				<Paper key={metric.label} withBorder radius="md" p="md">
					<Stack gap={4}>
						<Text c="dimmed" size="sm">
							{metric.label}
						</Text>
						<Text fw={700} size="xl">
							{metric.value}
						</Text>
						<Text size="sm" c="dimmed">
							{metric.note}
						</Text>
					</Stack>
				</Paper>
			))}
		</SimpleGrid>
	);
}
