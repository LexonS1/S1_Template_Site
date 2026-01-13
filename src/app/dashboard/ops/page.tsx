import { Anchor, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { OpsRequestForm } from "../_components/OpsRequestForm";
import { SubmissionLog } from "../_components/SubmissionLog";

export default function OpsPage() {
	return (
		<Stack gap="lg">
			<Group>
				<Link href="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
					<Anchor component="span" size="sm">
						← Back to dashboard
					</Anchor>
				</Link>
			</Group>
			<Stack gap={4}>
				<Title order={2}>Store request</Title>
				<Text c="dimmed">
					Request replenishments, merchandising, or store services.
				</Text>
			</Stack>
			<OpsRequestForm />
			<SubmissionLog
				page="ops"
				title="View store request logs"
				fields={[
					{ name: "team", label: "Team" },
					{
						name: "priority",
						label: "Priority",
						type: "select",
						options: [
							{ value: "low", label: "Low" },
							{ value: "medium", label: "Medium" },
							{ value: "high", label: "High" },
							{ value: "urgent", label: "Urgent" },
						],
					},
					{ name: "dueDate", label: "Due date", type: "date" },
					{ name: "request", label: "Request details", type: "textarea" },
				]}
			/>
		</Stack>
	);
}
