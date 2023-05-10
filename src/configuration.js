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
