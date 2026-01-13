import { Box, Group, Paper, Stack, Text, Title } from "@mantine/core";

type CycleTimeChartProps = {
	points: string;
	hasData: boolean;
};

export function CycleTimeChart({ points, hasData }: CycleTimeChartProps) {
	return (
		<Paper withBorder radius="md" p="lg">
			<Stack gap="sm">
				<Group justify="space-between">
					<Title order={3}>Cycle time trend</Title>
					<Text size="sm" c="dimmed">
						Days per delivery
					</Text>
				</Group>
				<Box
					style={{
						width: "100%",
						height: 160,
						borderRadius: 12,
						background: "linear-gradient(180deg, rgba(16, 24, 48, 0.9), rgba(9, 12, 24, 0.9))",
						padding: 12,
						display: "flex",
						alignItems: "center",
					}}
				>
					{!hasData ? (
						<Text size="sm" c="dimmed">
							Add forecast items to visualize trend.
						</Text>
					) : (
						<svg viewBox="0 0 280 120" width="100%" height="140" style={{ overflow: "visible" }}>
							<title>Cycle time trend line</title>
							<defs>
								<linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="rgba(77, 171, 247, 0.35)" />
									<stop offset="100%" stopColor="rgba(77, 171, 247, 0)" />
								</linearGradient>
							</defs>
							<polygon fill="url(#trendFill)" points={`0,120 ${points} 280,120`} />
							<polyline
								fill="none"
								stroke="rgba(77, 171, 247, 0.45)"
								strokeWidth="12"
								points={points}
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<polyline
								fill="none"
								stroke="#4dabf7"
								strokeWidth="3"
								points={points}
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					)}
				</Box>
			</Stack>
		</Paper>
	);
}
