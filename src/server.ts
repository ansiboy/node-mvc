import { Settings } from "./types";
import {
    WebServer, Settings as WebServerSettings, StaticFileProcessor, HeadersProcessor, VirtualDirectory
} from "maishu-node-web-server";

import * as fs from "fs";
import * as errors from "./errors";
import { MVCRequestProcessor } from "maishu-node-web-server-mvc";
import { JavaScriptProcessor } from "./processors/java-script-processor";
import { Json5Processor } from "./processors/json5-processor";

export function startServer(settings: Settings) {

    if (settings.rootDirectory == null)
        throw errors.arugmentFieldNull("rootDirectory", "settings");

    if (typeof settings.rootDirectory == "string" && !fs.existsSync(settings.rootDirectory))
        throw errors.physicalPathNotExists(settings.rootDirectory);

    var rootDirectory = typeof settings.rootDirectory == "string" ? new VirtualDirectory(settings.rootDirectory) : settings.rootDirectory;
    if (settings.staticRootDirectory == null) {
        let staticRootDirectory = rootDirectory.findDirectory("static");
        if (staticRootDirectory)
            settings.staticRootDirectory = staticRootDirectory;
    }

    if (settings.controllerDirectory == null) {
        let controllerDirectory = rootDirectory.findDirectory("controllers");
        if (controllerDirectory)
            settings.controllerDirectory = controllerDirectory;
    }

    let r: WebServerSettings = {
        port: settings.port,
        bindIP: settings.bindIP,
        websiteDirectory: settings.staticRootDirectory,
    }

    let server = new WebServer(r);


    let staticFileProcessor = server.requestProcessors.filter(o => o instanceof StaticFileProcessor)[0];
    console.assert(staticFileProcessor != null, "Can not find static file processor");
    let staticFileProcessorIndex = server.requestProcessors.indexOf(staticFileProcessor);

    var javaScriptProcessor = new JavaScriptProcessor();
    server.requestProcessors.splice(staticFileProcessorIndex, 0, javaScriptProcessor);

    var json5Processor = new Json5Processor();
    server.requestProcessors.splice(staticFileProcessorIndex, 0, json5Processor);

    if (settings.controllerDirectory) {
        let mvcProcessor = new MVCRequestProcessor({
            controllersDirectory: settings.controllerDirectory,
            serverContextData: settings.serverContextData,
        });
        server.requestProcessors.splice(staticFileProcessorIndex, 0, mvcProcessor);
    }

    if (settings.headers) {
        var headersProcessor = server.requestProcessors.filter(o => o instanceof HeadersProcessor)[0] as HeadersProcessor;
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

    return server;
}


