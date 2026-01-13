export type InventoryActionState = {
	ok: boolean;
	message: string;
	fieldErrors: Record<string, string>;
};

export const initialInventoryState: InventoryActionState = {
	ok: false,
	message: "",
	fieldErrors: {},
};
