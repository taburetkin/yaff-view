import { configuration, getConfigurationValue } from 'yaff-core';
Object.assign(configuration, {
	'view.get.options.invoke': true,
	'view.triggers.preventDefault': true,
	'view.triggers.stopPropagation': true,
	'view.render.children': true,
	'view.render.collection': false,
});

export {
	configuration, 
	getConfigurationValue
}

// export function getDefaultValueFromConfig(key, userValue, lastChanceValue) {
// 	if (userValue !== undefined) {
// 		return userValue;
// 	}
// 	if (arguments.length === 3) {
// 		return lastChanceValue;
// 	}
// 	const configValue = configuration[key];
// 	return configValue;
// }