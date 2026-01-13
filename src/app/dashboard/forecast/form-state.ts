export type ForecastActionState = {
	ok: boolean;
	message: string;
	fieldErrors: Record<string, string>;
};

export const initialForecastState: ForecastActionState = {
	ok: false,
	message: "",
	fieldErrors: {},
};
