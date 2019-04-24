"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
exports.contentTypes = {
    applicationJSON: 'application/json',
    textPlain: 'text/plain',
};
class ContentResult {
    constructor(content, contentType, statusCode) {
        if (content == null)
            throw errors_1.arugmentNull('content');
        this.content = content;
        this.contentType = contentType || exports.contentTypes.textPlain;
        this.statusCode = statusCode || 200;
    }
    execute(res) {
        res.setHeader("content-type", this.contentType);
        res.statusCode = this.statusCode;
        res.write(this.content);
    }
}
exports.ContentResult = ContentResult;
class RedirectResult {
    constructor(targetURL) {
        this.targetURL = targetURL;
    }
    execute(res) {
        res.writeHead(302, { 'Location': this.targetURL });
    }
}
exports.RedirectResult = RedirectResult;
//# sourceMappingURL=action-results.js.map