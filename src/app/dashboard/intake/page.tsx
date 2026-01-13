import { Anchor, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { IntakeForm } from "../_components/IntakeForm";
import { SubmissionLog } from "../_components/SubmissionLog";

export default function IntakePage() {
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
				<Title order={2}>Vendor intake</Title>
				<Text c="dimmed">
					Capture supplier details, catalog changes, and onboarding needs.
				</Text>
			</Stack>
			<IntakeForm />
			<SubmissionLog
				page="intake"
				title="View vendor intake logs"
				fields={[
					{ name: "fullName", label: "Full name" },
					{ name: "workEmail", label: "Work email", type: "email" },
					{ name: "company", label: "Company" },
					{ name: "summary", label: "Summary", type: "textarea" },
					{ name: "budget", label: "Budget", type: "number" },
				]}
			/>
		</Stack>
	);
}
