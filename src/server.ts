import { Settings } from "./types";
import {
    WebServer, StaticFileProcessor, HeadersProcessor, VirtualDirectory,
    getLogger
} from "maishu-node-web-server";

import { MVCRequestProcessor } from "maishu-node-web-server-mvc";
import { JavaScriptProcessor } from "./processors/java-script-processor";
import { Json5Processor } from "./processors/json5-processor";
import { LessProcessor } from "./processors/less-processor";
import * as errors from "./errors";
import * as fs from "fs";
import * as path from "path";
import { loadPlugins } from "./load-plugins";

export function startServer(settings: Settings) {

    if (settings.rootDirectory == null)
        throw errors.arugmentFieldNull("rootDirectory", "settings");

    if (typeof settings.rootDirectory == "string" && !fs.existsSync(settings.rootDirectory))
        throw errors.physicalPathNotExists(settings.rootDirectory);

    var rootDirectory = typeof settings.rootDirectory == "string" ? new VirtualDirectory(settings.rootDirectory) : settings.rootDirectory;
    if (settings.websiteDirectory == null) {
        let staticRootDirectory = rootDirectory.findDirectory("static");
        if (staticRootDirectory)
            settings.websiteDirectory = staticRootDirectory;
    }

    if (settings.controllerDirectory == null) {
        let controllerDirectory = rootDirectory.findDirectory("controllers");
        if (controllerDirectory)
            settings.controllerDirectory = controllerDirectory;
    }


    let server = new WebServer(settings);

    // let staticFileProcessor = server.requestProcessors.find(StaticFileProcessor);
    // console.assert(staticFileProcessor != null, "Can not find static file processor");
    // let staticFileProcessorIndex = server.requestProcessors.add(staticFileProcessor);

    var javaScriptProcessor = new JavaScriptProcessor();
    server.requestProcessors.add(javaScriptProcessor);

    var json5Processor = new Json5Processor();
    server.requestProcessors.add(json5Processor);

    var lessProcessor = new LessProcessor();
    server.requestProcessors.add(lessProcessor);

    if (settings.controllerDirectory) {
        let mvcProcessor = new MVCRequestProcessor({
            controllersDirectory: settings.controllerDirectory,
            serverContextData: settings.serverContextData,
        });
        server.requestProcessors.add(mvcProcessor);
    }

    if (settings.headers) {
        var headersProcessor = server.requestProcessors.find(HeadersProcessor);
        console.assert(headersProcessor != null, "Can not find headers processor.");
        headersProcessor.headers = headersProcessor.headers || {};
        for (let key in settings.headers) {
            headersProcessor.headers[key] = settings.headers[key];
        }
    }

    if (settings.virtualPaths) {
        for (let virtualPath in settings.virtualPaths) {
            let physicalPath = settings.virtualPaths[virtualPath];
            if (virtualPath[0] != "/")
                virtualPath = "/" + virtualPath;

            server.websiteDirectory.setPath(virtualPath, physicalPath);
        }
    }

    let packagePath = "../package.json";
    let pkg = require(packagePath);
    let logger = getLogger(pkg.name, settings.log?.level)
    loadPlugins(rootDirectory, logger, server);


    return server;
}


