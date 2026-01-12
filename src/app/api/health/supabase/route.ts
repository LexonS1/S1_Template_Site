import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export async function GET() {
	if (!supabaseUrl || !supabaseAnonKey) {
		return NextResponse.json(
			{
				ok: false,
				error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
			},
			{ status: 500 },
		);
	}

	try {
		const url = new URL("/auth/v1/health", supabaseUrl);
		const res = await fetch(url, {
			method: "GET",
			headers: {
				apikey: supabaseAnonKey,
				Authorization: `Bearer ${supabaseAnonKey}`,
			},
			cache: "no-store",
		});

		const body = await res.text();

		return NextResponse.json(
			{
				ok: res.ok,
				status: res.status,
				body,
			},
			{ status: res.ok ? 200 : 502 },
		);
	} catch (error) {
		return NextResponse.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : "Supabase unreachable",
			},
			{ status: 502 },
		);
	}
}
