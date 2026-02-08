/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/core/ComponentSupport", 
    "sap/ui/model/json/JSONModel",
    "ai/com/zb001/model/models"
],
    function (UIComponent, Device, _ComponentSupport, JSONModel, models) {
        "use strict";

        const DEFAULT_CHATKIT_CONFIG = {
            frameUrl: "http://localhost:4200/chatkit/index.html",
            apiUrl: "http://localhost:3000/api/ai",
            xpertId: "your-xpert-id-here"
        };

        return UIComponent.extend("ai.com.zb001.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
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

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
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
    }
);