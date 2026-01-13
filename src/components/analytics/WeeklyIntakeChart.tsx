import { Box, Group, Paper, Stack, Text, Title } from "@mantine/core";

type WeeklyPoint = {
	label: string;
	value: number;
};

type WeeklyIntakeChartProps = {
	points: WeeklyPoint[];
};

export function WeeklyIntakeChart({ points }: WeeklyIntakeChartProps) {
	const maxWeekly = Math.max(...points.map((item) => item.value), 1);

	return (
		<Paper withBorder radius="md" p="lg">
			<Stack gap="sm">
				<Group justify="space-between">
					<Title order={3}>Weekly intake</Title>
					<Text size="sm" c="dimmed">
						Last 7 days
					</Text>
				</Group>
				<Group align="flex-end" gap="sm" mt="md">
					{points.map((item) => (
						<Stack key={item.label} gap={6} align="center">
							<Box
								style={{
									width: 18,
									height: `${Math.round((item.value / maxWeekly) * 120)}px`,
									borderRadius: 6,
									background:
										"linear-gradient(180deg, rgba(77, 171, 247, 0.9), rgba(77, 171, 247, 0.4))",
								}}
							/>
							<Text size="xs" c="dimmed">
								{item.label}
							</Text>
						</Stack>
					))}
				</Group>
			</Stack>
		</Paper>
	);
}
