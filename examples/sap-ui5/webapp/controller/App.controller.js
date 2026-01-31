sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/base/strings/formatMessage",
	"sap/m/FlexItemData"
], (Device, Controller, Filter, FilterOperator, JSONModel, formatMessage, FlexItemData) => {
	"use strict";

	return Controller.extend("sap.ui.demo.todo.controller.App", {

		onInit() {
			this.aSearchFilters = [];
			this.aTabFilters = [];
			this._chatKitControl = null;

			this.getView().setModel(new JSONModel({
				isMobile: Device.browser.mobile
			}), "view");

			const chatkitConfig = this._getChatKitConfig();
			const chatkitModel = new JSONModel({
				frameUrl: chatkitConfig.frameUrl,
				isConfigured: !!chatkitConfig.frameUrl
			});
			this.getView().setModel(chatkitModel, "chatkit");

			if (chatkitConfig.frameUrl) {
				this._initChatKit(chatkitConfig);
			}
		},

		/**
		 * Get the default model from the view
		 *
		 * @returns {sap.ui.model.json.JSONModel} The model containing the todo list, etc.
		 */
		getModel() {
			return this.getView().getModel();
		},

		/**
		 * Adds a new todo item to the bottom of the list.
		 */
		addTodo() {
			const oModel = this.getModel();
			const aTodos = this.getTodos().map((oTodo) => Object.assign({}, oTodo));

			aTodos.push({
				title: oModel.getProperty("/newTodo"),
				completed: false
			});

			oModel.setProperty("/todos", aTodos);
			oModel.setProperty("/newTodo", "");
		},

		/**
		 * Trigger removal of all completed items from the todo list.
		 */
		onClearCompleted() {
			const aTodos = this.getTodos().map((oTodo) => Object.assign({}, oTodo));
			this.removeCompletedTodos(aTodos);
			this.getModel().setProperty("/todos", aTodos);
		},

		/**
		 * Removes all completed items from the given todos.
		 *
		 * @param {object[]} aTodos
		 */
		removeCompletedTodos(aTodos) {
			let i = aTodos.length;
			while (i--) {
				const oTodo = aTodos[i];
				if (oTodo.completed) {
					aTodos.splice(i, 1);
				}
			}
		},

		/**
		 * Determines the todo list
		 *
		 * @returns {object[]} The todo list
		 */
		getTodos(){
			const oModel = this.getModel();
			return oModel && oModel.getProperty("/todos") || [];
		},

		/**
		 * Updates the number of items not yet completed
		 */
		onUpdateItemsLeftCount() {
			const iItemsLeft = this.getTodos().filter((oTodo) => oTodo.completed !== true).length;
			this.getModel().setProperty("/itemsLeftCount", iItemsLeft);
		},

		/**
		 * Trigger search for specific items. The removal of items is disable as long as the search is used.
		 * @param {sap.ui.base.Event} oEvent Input changed event
		 */
		onSearch(oEvent) {
			const oModel = this.getModel();

			// First reset current filters
			this.aSearchFilters = [];

			// add filter for search
			this.sSearchQuery = oEvent.getSource().getValue();
			if (this.sSearchQuery && this.sSearchQuery.length > 0) {
				oModel.setProperty("/itemsRemovable", false);
				const filter = new Filter("title", FilterOperator.Contains, this.sSearchQuery);
				this.aSearchFilters.push(filter);
			} else {
				oModel.setProperty("/itemsRemovable", true);
			}

			this._applyListFilters();
		},

		onFilter(oEvent) {
			// First reset current filters
			this.aTabFilters = [];

			// add filter for search
			this.sFilterKey = oEvent.getParameter("item").getKey();

			switch (this.sFilterKey) {
				case "active":
					this.aTabFilters.push(new Filter("completed", FilterOperator.EQ, false));
					break;
				case "completed":
					this.aTabFilters.push(new Filter("completed", FilterOperator.EQ, true));
					break;
				case "all":
				default:
				// Don't use any filter
			}

			this._applyListFilters();
		},

		_applyListFilters() {
			const oList = this.byId("todoList");
			const oBinding = oList.getBinding("items");

			oBinding.filter(this.aSearchFilters.concat(this.aTabFilters), "todos");

			const sI18nKey = this.getI18NKey(this.sFilterKey, this.sSearchQuery);

			this.byId("filterToolbar").setVisible(!!sI18nKey);
			if (sI18nKey) {
				this.byId("filterLabel").bindProperty("text", {
					path: sI18nKey,
					model: "i18n",
					formatter: (textWithPlaceholder) => {
						return formatMessage(textWithPlaceholder, [this.sSearchQuery]);
					}
				});
			}
		},

		getI18NKey(sFilterKey, sSearchQuery) {
			if (!sFilterKey || sFilterKey === "all") {
				return sSearchQuery ? "ITEMS_CONTAINING" : undefined;
			} else if (sFilterKey === "active") {
				return "ACTIVE_ITEMS" + (sSearchQuery ? "_CONTAINING" : "");
			} else {
				return "COMPLETED_ITEMS" + (sSearchQuery ? "_CONTAINING" : "");
			}
		},

		_addTodosFromEffect(payload) {
			const entries = Array.isArray(payload) ? payload : [payload];
			const todosToAdd = [];

			entries.forEach((entry) => {
				if (!entry) {
					return;
				}

				const rawText = typeof entry === "string" ? entry : entry.content || entry.title || entry.text;
				if (typeof rawText !== "string") {
					return;
				}

				rawText.split(/\r?\n/).forEach((line) => {
					const cleaned = line.trim().replace(/^[-*]\s+/, "").replace(/^\d+[.)]\s+/, "").trim();
					if (cleaned) {
						todosToAdd.push({
							title: cleaned,
							completed: false
						});
					}
				});
			});

			if (!todosToAdd.length) {
				return;
			}

			const updatedTodos = this.getTodos().map((todo) => Object.assign({}, todo)).concat(todosToAdd);
			this.getModel().setProperty("/todos", updatedTodos);
		},

		_getChatKitConfig() {
			const ownerComponent = this.getOwnerComponent();
			return ownerComponent && ownerComponent.getChatKitConfig ? ownerComponent.getChatKitConfig() : {};
		},

		_initChatKit(chatkitConfig) {
			const chatContainer = this.byId("chatKitContainer");
			if (!chatContainer) {
				return;
			}

			const { frameUrl, apiUrl, xpertId } = chatkitConfig;

			sap.ui.require(["xpertai/chatkit/ui5"], (ChatKitLib) => {
				if (this._chatKitControl) {
					this._chatKitControl.destroy();
				}

				this._chatKitControl = new ChatKitLib.ChatKit({
					layoutData: new FlexItemData({
						growFactor: 1
					}),
					config: {
						frameUrl,
						composer: {
							attachments: {
								enabled: true,
								maxCount: 5,
								maxSize: 10485760 // 10MB
							},
						},
						api: {
							apiUrl,
							xpertId,
							getClientSecret: () => {
								// Call your backend odata to get a valid client secret for the user
								return 'your-client-secret-from-backend';
							}
						},
						onEffect: ({ name, data }) => {
							console.log(`Effect triggered: ${name}`, data)
							if (name === 'write_todos' && data && typeof data === 'object') {
								const payload = data // as { content: string }[]
								this._addTodosFromEffect(payload.todos);
							}
						},
						onClientTool: async (params) => {
							/**
							 * Example params of client tool call:
							 * ```json
							 * {
									"name": "save_todos",
									"params": {},
									"id": "call_00_XUqLw2FLW98gZkPcATn97qtv"
								}
							 */
							console.log("Client tool requested:", params);
							if (params.name === 'save_storage_positions') {
								console.log("Saving storage positions:", params.params);
								return {
									tool_call_id: params.id,
									name: params.name,
									status: 'success',
									content: 'Saved!',
								};
							}
							
							// You can implement custom client tools here
							return {
								tool_call_id: params.id,
								name: params.name,
								status: 'failed',
								content: 'Unknown client tool'
							};
						}
					}
				});
				this._chatKitControl.addStyleClass("chatKitHost");

				chatContainer.removeAllItems();
				chatContainer.addItem(this._chatKitControl);
			}, (error) => {
				// eslint-disable-next-line no-console
				console.error("Failed to load ChatKit control", error);
			});
		},

		onExit() {
			if (this._chatKitControl) {
				this._chatKitControl.destroy();
				this._chatKitControl = null;
			}
		}
	});

});
