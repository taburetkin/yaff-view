import { View } from "../_ViewConstructor.js";

export function isViewClass(arg) {
	return isClass(arg, View);
}

export function isView(arg) {
	return arg instanceof View;
}