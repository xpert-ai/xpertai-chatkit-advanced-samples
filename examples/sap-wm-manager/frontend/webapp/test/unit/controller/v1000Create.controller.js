/*global QUnit*/

sap.ui.define([
	"ai/com/zb001/controller/v1000Create.controller"
], function (Controller) {
	"use strict";

	QUnit.module("v1000Create Controller");

	QUnit.test("I should test the v1000Create controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
