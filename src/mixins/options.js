import { configuration } from "../configuration.js";
import { invokeValue, takeFirst } from "../utils/core.js";


const normalized = Symbol('normalized');

export function normalizeOptions(options, context) {
	if (options && normalized in options) { return options; }
	
	const configInvoke = configuration['view.get.options.invoke'] || false;

	if (options == null) { options = configInvoke; }
	
	if (options === false) {
		return {
			[normalized]: 1
		}
	}

	if (options === true) {
		return {
			invoke: true,
			invokeContext: context,
			invokeArgs: context,
			[normalized]: 1
		}
	}

	let { invoke, invokeContext, invokeArgs } = options;
	if (invoke == null) {
		invoke = !!(invokeContext || invokeArgs != null);
	}

	const shouldInvoke = invoke == null ? configInvoke : invoke;

	if (shouldInvoke) {
		invoke = true;
		invokeContext = invokeContext || context;
		invokeArgs = invokeArgs == null ? context : invokeArgs;
	}
	return Object.assign({}, options, { invoke, invokeContext, invokeArgs, [normalized]:1 });
}

export const optionsMixin = {

	get(arg, options) {
		if (arg == null) {
			throw new Error('wrong use of .get(), key not provided');
		}

		options = normalizeOptions(options, this);
		let isArray = Array.isArray(arg);
		let replaceKeys = {};
		if (arg && typeof arg === 'object' && !isArray) {
			replaceKeys = arg;
			arg = Object.keys(arg);
			isArray = true;
		}

		if (!isArray) {
			const value = takeFirst(arg, this.options, this);
			return options.invoke ? invokeValue(value, options.invokeContext, options.invokeArgs) : value;
		}

		return arg.reduce((memo, key) => {
			const value = this.get(key, options);
			if (value === undefined && options.ignoreUndefined) {
				return memo;
			}
			const memoKey = replaceKeys[key] || key;
			memo[memoKey] = value;
			return memo;
		}, {});

	},

}