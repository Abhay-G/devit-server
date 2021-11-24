module.exports = function (schema) {
	for (let path in schema.paths) {
		if (schema.paths[path].instance === "Array") {
			const options = schema.paths[path].options;
			const { minItems, maxItems, uniqueItems } = options;

			if (maxItems || (maxItems && maxItems.value))
				schema.paths[path].validators.push(getMaxValidator(maxItems));
			if (minItems || (minItems && minItems.value))
				schema.paths[path].validators.push(getMinValidator(minItems));
			if (
				(typeof uniqueItems === "boolean" && uniqueItems !== false) ||
				(uniqueItems && uniqueItems.value !== false)
			)
				schema.paths[path].validators.push(
					getUniqueValidator(uniqueItems)
				);
		}
	}

	/**
	 * Gets the schema validator for a maximum amount of array items
	 * @param {*} maxItems number of maximum array length | object with number `value` and validator `message` callback
	 */
	function getMaxValidator(maxItems) {
		var value = typeof maxItems === "object" ? maxItems.value : maxItems;

		const messageCb = (value) => {
			return (props) =>
				`Array length of \`${props.path}\` (${props.value.length}) is more than maximum allowed length (${value}).`;
		};

		return {
			validator: function (v) {
				return v.length <= value;
			},
			message:
				typeof maxItems === "object" && maxItems.message
					? maxItems.message
					: messageCb(value),
		};
	}

	/**
	 * Gets the schema validator for a minimum amount of array items
	 * @param {*} minItems number of minimum array length | object with number `value` and validator `message` callback
	 */
	function getMinValidator(minItems) {
		var value = typeof minItems === "object" ? minItems.value : minItems;

		const messageCb = (value) => {
			return (props) =>
				`Array length of \`${props.path}\` (${props.value.length}) is less than minimum allowed length (${value}).`;
		};

		return {
			validator: function (v) {
				return v.length >= value;
			},
			message:
				typeof minItems === "object" && minItems.message
					? minItems.message
					: messageCb(value),
		};
	}

	/**
	 * Gets the schema validator for unique items of an array
	 * @param {*} uniqueItems boolean that determines if array content is unique | object with `value` and validator `message` callback
	 */
	function getUniqueValidator(uniqueItems) {
		var value =
			typeof uniqueItems === "object" ? uniqueItems.value : uniqueItems;

		const messageCb = (value) => {
			return (props) => `Values of \`${props.path}\` must be unique.`;
		};

		return {
			validator: function (v) {
				return (
					v.filter(
						(value, index, self) => self.indexOf(value) === index
					).length === v.length
				);
			},
			message:
				typeof uniqueItems === "object" && uniqueItems.message
					? uniqueItems.message
					: messageCb(value),
		};
	}
};
