// TODO Complete the implementation
// https://docs.fontawesome.com/web/setup/packages#kit-package
// https://github.com/FortAwesome/react-fontawesome/blob/976c1adc59934b34e52b11c03dda4bd69831a6df/src/components/FontAwesomeIcon.js

export type HintedString<TKnownValues extends string> =
	| (string & NonNullable<unknown>)
	| TKnownValues;

export interface IFontAwesome_Props {
	icon: HintedString<ICommonFontAwesomeIcons>;
	// icon: ICommonFontAwesomeIcons;
	brands?: boolean;
	class?: string;
	duotone?: boolean;
	light?: boolean;
	regular?: boolean;
	solid?: boolean;
	thin?: boolean;
}

type ICommonFontAwesomeIcons =
	| "rotate"
	| "flip"
	| "angle-left"
	| "angle-right"
	| "angle-down"
	| "angle-up"
	| "eye"
	| "eye-slash"
	| "user-circle"
	| "unlock-keyhole"
	| "key"
	| "copy"
	| "paste"
	| "eraser"
	| "search"
	| "plus"
	| "minus"
	| "pen-to-square"
	| "id-card"
	| "envelope"
	| "ellipsis-v"
	| "house"
	| "user-pen"
	| "info"
	| "arrow-right-from-bracket"
	| "user-plus";

/**
 * Renders a FontAwesome icon.
 *
 * @param {IFontAwesome_Props} props - The props for the FontAwesome component.
 * @returns {JSX.Element} The rendered FontAwesome icon.
 */
export function FontAwesome(props: IFontAwesome_Props): HTMLElement {
	let prefix = "fa-solid";

	if (props.brands) {
		prefix = "fa-brands";
	} else if (props.duotone) {
		prefix = "fa-duotone";
	} else if (props.light) {
		prefix = "fa-light";
	} else if (props.regular) {
		prefix = "fa-regular";
	} else if (props.thin) {
		prefix = "fa-thin";
	}

	let icon: string = props.icon;
	if (!props.icon.startsWith("fa-")) {
		icon = `fa-${props.icon}`;
	}

	// return <i class={`fontAwesomeIcon ${props.class || ""} ${prefix} ${icon}`}></i>;
	return <i class={["fontAwesomeIcon", props.class, prefix, icon]}></i>;
}
