"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./dist/server");
exports.startServer = server_1.startServer;
var attributes_1 = require("./dist/attributes");
exports.controller = attributes_1.controller;
exports.action = attributes_1.action;
exports.register = attributes_1.register;
exports.createParameterDecorator = attributes_1.createParameterDecorator;
exports.formData = attributes_1.formData;
exports.routeData = attributes_1.routeData;
var action_results_1 = require("./dist/action-results");
exports.ContentResult = action_results_1.ContentResult;
exports.RedirectResult = action_results_1.RedirectResult;
var controller_1 = require("./dist/controller");
exports.Controller = controller_1.Controller;
