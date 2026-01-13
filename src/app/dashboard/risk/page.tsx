import { Anchor, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { RiskReviewForm } from "@/components/dashboard/forms/RiskReviewForm";
import { SubmissionLog } from "@/components/dashboard/SubmissionLog";

export default function RiskPage() {
	return (
		<Stack gap="lg">
			<Group>
				<Link href="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
					<Anchor component="span" size="sm">
						Back to dashboard
					</Anchor>
				</Link>
			</Group>
			<Stack gap={4}>
				<Title order={2}>Issue review</Title>
				<Text c="dimmed">
					Log incidents, returns, and delivery blockers early.
				</Text>
			</Stack>
			<RiskReviewForm />
			<SubmissionLog
				page="risk"
				title="View issue logs"
				fields={[
					{ name: "area", label: "Risk area" },
					{
						name: "level",
						label: "Risk level",
						type: "select",
						options: [
							{ value: "low", label: "Low" },
							{ value: "moderate", label: "Moderate" },
							{ value: "high", label: "High" },
							{ value: "critical", label: "Critical" },
						],
					},
					{ name: "impact", label: "Impact summary", type: "textarea" },
					{ name: "mitigation", label: "Mitigation plan", type: "textarea" },
				]}
			/>
		</Stack>
	);
}






