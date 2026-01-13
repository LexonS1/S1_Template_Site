import { Text } from "@mantine/core";
import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseClient } from "@/lib/supabase";
import { type SubmissionField, SubmissionLogClient } from "./SubmissionLogClient";

type SubmissionLogProps = {
	page: string;
	title: string;
	fields: SubmissionField[];
};

type SubmissionRow = {
	id: string;
	created_at: string;
	payload: Record<string, unknown>;
};

export async function SubmissionLog({ page, title, fields }: SubmissionLogProps) {
	noStore();
	const supabase = createSupabaseClient();
	const { data, error } = await supabase
		.from("dashboard_submissions")
		.select("id, created_at, payload")
		.eq("page", page)
		.order("created_at", { ascending: false })
		.limit(20);

	if (error) {
		return (
			<Text c="red" size="sm">
				Unable to load submissions right now.
			</Text>
		);
	}

	return (
		<SubmissionLogClient
			page={page}
			title={title}
			fields={fields}
			entries={(data ?? []) as SubmissionRow[]}
		/>
	);
}
