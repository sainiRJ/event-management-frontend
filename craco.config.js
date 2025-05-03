const path = require("path");

module.exports = {
	webpack: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			"@assets": path.resolve(__dirname, "src/assets"),
			"@components": path.resolve(__dirname, "src/components"),
			"@config": path.resolve(__dirname, "src/config"),
			"@constants": path.resolve(__dirname, "src/constants"),
			"@customTypes": path.resolve(__dirname, "src/customTypes"),
			"@services": path.resolve(__dirname, "src/services"),
			"@store": path.resolve(__dirname, "src/store"),
			"@styles": path.resolve(__dirname, "src/styles"),
			"@utils": path.resolve(__dirname, "src/utils"),
		},
	},
};
