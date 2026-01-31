sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/FlexItemData",
    "../utils/UIConstants",
],
    function (Controller, JSONModel, MessageBox, MessageToast, FlexItemData, UIConstants) {
        "use strict";

        return Controller.extend("ai.com.zb001.controller.v1000Create", {
            onInit: function () {
                this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                let oDataModel = new JSONModel({
                    editList: [],
                    aEditInfoLists: [],
                    aInfoList: []
                });
                this.getView().setModel(oDataModel, "Datas");

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

            _getChatKitConfig: function () {
                const ownerComponent = this.getOwnerComponent();
                return ownerComponent && ownerComponent.getChatKitConfig ? ownerComponent.getChatKitConfig() : {};
            },

            _initChatKit: function (chatkitConfig) {
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
                                    maxSize: 10485760
                                },
                            },
                            api: {
                                apiUrl,
                                xpertId,
                                getClientSecret: async () => {
                                    return await this._getClientSecret();
                                }
                            },
                            onEffect: ({ name, data }) => {
                                if (name === 'create_storage_position' && data && typeof data === 'object') {
                                    const payload = data;
                                    this._addTodosFromEffect(payload);
                                } else if (name === 'save_storage_positions') {
                                    this.onSaveALL();
                                }
                            },
                        }
                    });
                    this._chatKitControl.addStyleClass("chatKitHost");

                    chatContainer.removeAllItems();
                    chatContainer.addItem(this._chatKitControl);
                }, (error) => {
                    console.error("Failed to load ChatKit control", error);
                });
            },

            _getClientSecret: async function () {
                const chatkitConfig = this._getChatKitConfig();
                const { xpertId } = chatkitConfig;
                let oSrvModel = this.getOwnerComponent().getModel("clientSecretService");
                if (oSrvModel.isMetadataLoadingFailed()) {
                    MessageBox.error(this.oBundle.getText(UIConstants.TEXT.TXTSAVAFAILED));
                } else {
                    let oUploadData = false;
                    let object = {};
                    object.Assistantid = xpertId;
                    oUploadData = await new Promise((resolve) => {
                        oSrvModel.create("/ZClentSecretSet", object, {
                            success: function (oResponse) {
                                resolve(oResponse);
                            },
                            error: function () {
                                resolve(false);
                            }
                        });
                    });
                    if (oUploadData) {
                        return oUploadData.Clientsecret;
                    } else {
                        MessageBox.error(this.oBundle.getText(UIConstants.TEXT.TXTSAVAFAILED));
                    }
                }
            },

            _addTodosFromEffect: function (payload) {
                let alist = this.getView().getModel("Datas").getProperty("/aInfoList");
                let aEditList = this.getView().getModel("Datas").getProperty("/aEditInfoLists");
                let id = 1;
                if (alist && alist.length > 0) {
                    const maxId = Math.max(...alist.map(item => item.id || 0));
                    id = maxId + 1;
                }
                alist.push({
                    "id": id,
                    "warehouseNumber": payload.warehouseNumber,
                    "storageType": payload.storageType,
                    "binCode": payload.positionCode,
                    "binType": payload.positionType,
                    "storageZone": payload.storagePartition
                });
                aEditList.push({
                    "id": id,
                    "warehouseNumber": payload.warehouseNumber,
                    "storageType": payload.storageType,
                    "binCode": payload.positionCode,
                    "binType": payload.positionType,
                    "storageZone": payload.storagePartition
                });
                this.getView().getModel("Datas").setProperty("/aInfoList", alist);
                this.getView().getModel("Datas").setProperty("/aEditInfoLists", aEditList);
            },

            onChangeInputCheck: function (oEvent) {
                let alist = this.getView().getModel("Datas").getProperty("/aInfoList");
                let oInput = oEvent.getSource();
                let sName = oInput.getName();
                let sValue = oInput.getValue();
                let data = oInput.getBindingContext("Datas").getObject();
                if (!sValue) {
                    oInput.setValueState(sap.ui.core.ValueState.Error);
                    oInput.setValueStateText(sName + UIConstants.SYSTEM.BLANK + this.oBundle.getText(UIConstants.TEXT.TXTMUSTNOTBEEMPTY));
                    const result = alist.find(item => item.id === data.id);
                    if (result) {
                        result[sName + "_errorFlag"] = true;
                        this.getView().getModel("Datas").setProperty("/aInfoList", alist);
                    }
                } else {
                    oInput.setValueState(sap.ui.core.ValueState.None);
                    oInput.setValueStateText("");
                    const result = alist.find(item => item.id === data.id);
                    if (result) {
                        result[sName + "_errorFlag"] = false;
                        this.getView().getModel("Datas").setProperty("/aInfoList", alist);
                    }
                }
            },

            onSave: async function () {
                let oTable = this.byId("tableId");
                let aIndices = oTable.getSelectedIndices();
                if (aIndices.length === 0) {
                    MessageBox.error(this.oBundle.getText(UIConstants.TEXT.TXTSELECTDATA));
                    return;
                }
                let alist = [];
                for (let aIndice of aIndices) {
                    let oSelectedData = oTable.getContextByIndex(aIndice).getObject();
                    alist.push(oSelectedData);
                }
                let errorFlag = this.hasErrorFlag(alist);
                if (errorFlag) {
                    MessageBox.error(this.oBundle.getText(UIConstants.TEXT.TXTUNAVAILABLEDUE));
                } else {
                    let that = this;
                    MessageBox.information(this.oBundle.getText(UIConstants.TEXT.TXTCONFIRMSAVE),
                        {
                            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                            emphasizedAction: "YES",
                            onClose: async function (sAction) {
                                if (sAction === "YES") {
                                    sap.ui.core.BusyIndicator.show(0);
                                    await that.saveData(alist);
                                    sap.ui.core.BusyIndicator.hide();
                                }
                            }
                        }
                    );
                }
            },

            onSaveALL: async function () {
                let alist = this.getView().getModel("Datas").getProperty("/aInfoList");
                if (alist.length === 0) {
                    MessageBox.error(this.oBundle.getText(UIConstants.TEXT.TXTSAVAEDDATA));
                    return;
                }
                let errorFlag = this.hasErrorFlag(alist);
                if (errorFlag) {
                    MessageBox.error(this.oBundle.getText(UIConstants.TEXT.TXTUNAVAILABLEDUE));
                } else {
                    let that = this;
                    MessageBox.information(this.oBundle.getText(UIConstants.TEXT.TXTCONFIRMSAVE),
                        {
                            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                            emphasizedAction: "YES",
                            onClose: async function (sAction) {
                                if (sAction === "YES") {
                                    sap.ui.core.BusyIndicator.show(0);
                                    await that.saveData(alist);
                                    sap.ui.core.BusyIndicator.hide();
                                }
                            }
                        }
                    );
                }
            },

            saveData: async function (alist) {
                let oSrvModel = this.getOwnerComponent().getModel("odataService");
                if (oSrvModel.isMetadataLoadingFailed()) {
                    MessageBox.error(this.oBundle.getText(UIConstants.TEXT.TXTSAVAFAILED));
                } else {
                    let failLists = [];
                    for (let aData of alist) {
                        let oUploadData = false;
                        let object = {};
                        object.Lgnum = aData.warehouseNumber;
                        object.Lgpla = aData.binCode;
                        object.Lgtyp = aData.storageType;
                        object.Lgber = aData.storageZone;
                        object.Lptyp = aData.binType;
                        oUploadData = await new Promise((resolve) => {
                            oSrvModel.create("/ZScwmLagpAiPostSet", object, {
                                success: function (oResponse) {
                                    resolve(oResponse);
                                },
                                error: function () {
                                    resolve(false);
                                }
                            });
                        });
                        if (oUploadData) {
                            let alist = this.getView().getModel("Datas").getProperty("/aInfoList");
                            const newArray = alist.filter(item => item.id !== aData.id);
                            this.getView().getModel("Datas").setProperty("/aInfoList", newArray);
                            let aEditList = this.getView().getModel("Datas").getProperty("/aEditInfoLists");
                            const newEditArray = aEditList.filter(item => item.id !== aData.id);
                            this.getView().getModel("Datas").setProperty("/aEditInfoLists", newEditArray);
                        } else {
                            failLists.push(aData);
                        }
                    }
                    if (failLists.length > 0) {
                        MessageBox.error(this.generateFailedDataText(failLists));
                    } else {
                        MessageToast.show(this.oBundle.getText(UIConstants.TEXT.TXTSAVASUCCESSFULLY));
                    }
                }
            },

            generateFailedDataText: function (dataArray) {
                let result = this.oBundle.getText(UIConstants.TEXT.TXTFAILEDDATA) + UIConstants.SYSTEM.SYMBOLN;
                dataArray.forEach((item, index) => {
                    const line = this.oBundle.getText(UIConstants.TEXT.LBLAWAREHOUSENUMBER) + `${item.warehouseNumber}` + UIConstants.SYSTEM.SYMBOL
                        + this.oBundle.getText(UIConstants.TEXT.LBLASTORAGETYPE) + `${item.storageType}` + UIConstants.SYSTEM.SYMBOL
                        + this.oBundle.getText(UIConstants.TEXT.LBLABINCODE) + `${item.binCode}` + UIConstants.SYSTEM.SYMBOL
                        + this.oBundle.getText(UIConstants.TEXT.LBLABINTYPE) + `${item.binType}` + UIConstants.SYSTEM.SYMBOL
                        + this.oBundle.getText(UIConstants.TEXT.LBLASTORAGEZONE) + `${item.storageZone}`;
                    result += line + UIConstants.SYSTEM.SYMBOLN;
                });
                return result;
            },

            onEdit: function () {
                let oTable = this.byId("tableId");
                let aIndices = oTable.getSelectedIndices();
                if (aIndices.length === 0) {
                    MessageBox.error(this.oBundle.getText(UIConstants.TEXT.TXTSELECTDATA));
                    return;
                }
                let editlist = [];
                for (let aIndice of aIndices) {
                    let oSelectedData = oTable.getContextByIndex(aIndice).getObject();
                    editlist.push(oSelectedData.id);
                }
                this.getView().getModel("Datas").setProperty("/editList", editlist);
            },

            onClearAllEdit: function () {
                let that = this;
                MessageBox.information(this.oBundle.getText(UIConstants.TEXT.TXTCONFIRMCANCEL),
                    {
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        emphasizedAction: "YES",
                        onClose: async function (sAction) {
                            if (sAction === "YES") {
                                let aEditList = that.getView().getModel("Datas").getProperty("/aEditInfoLists");
                                if (aEditList) {
                                    that.getView().getModel("Datas").setProperty("/aInfoList", aEditList);
                                }
                                that.getView().getModel("Datas").setProperty("/editList", []);
                            }
                        }
                    }
                );
            },

            hasErrorFlag: function (alist) {
                let aFieldList = ["warehouseNumber", "storageType", "binCode", "binType"];
                return aFieldList.some(field => {
                    const errorField = field + "_errorFlag";
                    return alist.some(item => item[errorField] === true);
                });
            },

            onDelete: function () {
                let oTable = this.byId("tableId");
                let aIndices = oTable.getSelectedIndices();
                if (aIndices.length === 0) {
                    MessageBox.error(this.oBundle.getText(UIConstants.TEXT.TXTSELECTDATA));
                    return;
                }
                let that = this;
                MessageBox.information(this.oBundle.getText(UIConstants.TEXT.TXTCONFIRMDELETE),
                    {
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        emphasizedAction: "YES",
                        onClose: function (sAction) {
                            if (sAction === "YES") {
                                let alist = that.getView().getModel("Datas").getProperty("/aInfoList");
                                for (let aIndice of aIndices) {
                                    let oSelectedData = oTable.getContextByIndex(aIndice).getObject();
                                    const newArray = alist.filter(item => item.id !== oSelectedData.id);
                                    that.getView().getModel("Datas").setProperty("/aInfoList", newArray);
                                    let aEditList = that.getView().getModel("Datas").getProperty("/aEditInfoLists");
                                    const newEditArray = aEditList.filter(item => item.id !== oSelectedData.id);
                                    that.getView().getModel("Datas").setProperty("/aEditInfoLists", newEditArray);
                                }
                            }
                        }
                    }
                );
            },

            clearAllFilters: function () {
                let oTable = this.byId("tableId");
                let aColumns = oTable.getColumns();
                for (let i = 0; i < aColumns.length; i++) {
                    oTable.filter(aColumns[i], null);
                }
            },

            clearAllSortings: function () {
                let oTable = this.byId("tableId");
                var aColumns = oTable.getColumns();
                for (let i = 0; i < aColumns.length; i++) {
                    aColumns[i].setSorted(false);
                }
                oTable.getBinding().sort(null);
            },

            deleteAll: function () {
                let that = this;
                let alist = this.getView().getModel("Datas").getProperty("/aInfoList");
                if (alist.length === 0) {
                    MessageBox.error(this.oBundle.getText(UIConstants.TEXT.TXTDELETEDATA));
                    return;
                }
                MessageBox.information(this.oBundle.getText(UIConstants.TEXT.TXTCONFIRMDELETE),
                    {
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        emphasizedAction: "YES",
                        onClose: function (sAction) {
                            if (sAction === "YES") {
                                that.getView().getModel("Datas").setProperty("/aInfoList", []);
                                this.getView().getModel("Datas").setProperty("/aEditInfoLists", []);
                            }
                        }
                    }
                );
            }
        });
    });
