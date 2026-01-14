sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/core/ComponentSupport", "sap/ui/model/json/JSONModel"], (UIComponent, _ComponentSupport, JSONModel) => {
	"use strict";

	const DEFAULT_CHATKIT_CONFIG = {
		frameUrl: "http://localhost:4200/chatkit/index.html",
		apiUrl: "http://localhost:3000/api/ai",
		xpertId: "your-xpert-id-here"
	};

	return UIComponent.extend("sap.ui.demo.todo.Component", {
		metadata: {
			manifest: "json",
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
		},

		init() {
			UIComponent.prototype.init.apply(this, arguments);

			const chatkitConfig = Object.assign(
				{},
				DEFAULT_CHATKIT_CONFIG,
				this._getManifestChatKitConfig(),
				this._getWindowChatKitConfig()
			);

			this.setModel(new JSONModel({
				chatkit: chatkitConfig
			}), "config");
		},

		getChatKitConfig() {
			const configModel = this.getModel("config");
			return configModel ? configModel.getProperty("/chatkit") : Object.assign({}, DEFAULT_CHATKIT_CONFIG);
		},

		_getManifestChatKitConfig() {
			const manifestEntry = this.getMetadata().getManifestEntry("sap.ui5") || {};
			return manifestEntry.config && manifestEntry.config.chatkit ? manifestEntry.config.chatkit : {};
		},

		_getWindowChatKitConfig() {
			const overrides = {};
			const fromGlobal = (source, key) => {
				if (source && typeof source[key] === "string" && source[key]) {
					overrides[key] = source[key];
				}
			};

			if (typeof window !== "undefined") {
				const globalConfig = window.CHATKIT_CONFIG;
				if (globalConfig && typeof globalConfig === "object") {
					fromGlobal(globalConfig, "frameUrl");
					fromGlobal(globalConfig, "apiUrl");
					fromGlobal(globalConfig, "xpertId");
				}

				fromGlobal(window, "CHATKIT_FRAME_URL");
				fromGlobal(window, "CHATKIT_API_URL");
				fromGlobal(window, "CHATKIT_XPERT_ID");
			}

			return overrides;
		}
	});
});
