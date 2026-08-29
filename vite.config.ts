import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

/**
 * Aliases mirror the ones that used to live in craco.config.js, and the
 * matching `paths` entries in tsconfig.json.
 */
export default defineConfig({
	plugins: [react()],
	server: {
		port: 3000,
		open: false,
	},
	preview: {
		port: 3000,
	},
	build: {
		outDir: "build",
		sourcemap: false,
	},
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "src"),
			"@assets": path.resolve(import.meta.dirname, "src/assets"),
			"@components": path.resolve(import.meta.dirname, "src/components"),
			"@config": path.resolve(import.meta.dirname, "src/config"),
			"@constants": path.resolve(import.meta.dirname, "src/constants"),
			"@customTypes": path.resolve(import.meta.dirname, "src/customTypes"),
			"@services": path.resolve(import.meta.dirname, "src/services"),
			"@store": path.resolve(import.meta.dirname, "src/store"),
			"@styles": path.resolve(import.meta.dirname, "src/styles"),
			"@utils": path.resolve(import.meta.dirname, "src/utils"),
		},
	},
});
