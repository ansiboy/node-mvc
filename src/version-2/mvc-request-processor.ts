import { RequestProcessor, RequestContext, Content, ExecuteResult, VirtualDirectory } from "maishu-node-web-server";
import { ControllerLoader } from "./controller-loader";
import { ServerContext } from "./types";
import * as errors from "../errors";
import { ActionParameterDecoder, metaKeys } from "./attributes";
import * as http from "http";

export class MVCRequestProcessor implements RequestProcessor {

    #controllerLoader: ControllerLoader;
    #serverContext: ServerContext;

    constructor(controllersDirecotry: VirtualDirectory) {
        this.#serverContext = {};
        this.#controllerLoader = new ControllerLoader(controllersDirecotry);
    }
    async execute(args: RequestContext): Promise<ExecuteResult> {

        let actionResult = this.#controllerLoader.findAction(args.virtualPath);
        if (actionResult == null)
            return null;

        let r = await this.executeAction(this.#serverContext, actionResult.controller, actionResult.action,
            actionResult.routeData, args.req, args.res);
            
        return { content: JSON.stringify(r) };

    }

    private executeAction(serverContext: ServerContext, controller: object, action: Function, routeData: { [key: string]: string } | null,
        req: http.IncomingMessage, res: http.ServerResponse) {

        if (!controller)
            throw errors.arugmentNull("controller")

        if (!action)
            throw errors.arugmentNull("action")

        if (!req)
            throw errors.arugmentNull("req");

        if (!res)
            throw errors.arugmentNull("res");

        routeData = routeData || {};

        let parameterDecoders: (ActionParameterDecoder<any>)[] = [];
        parameterDecoders = Reflect.getMetadata(metaKeys.parameter, controller, action.name) || [];
        parameterDecoders.sort((a, b) => a.parameterIndex < b.parameterIndex ? -1 : 1);
        let parameters: object[] = []
        return Promise.all(parameterDecoders.map(p => p.createParameter(req, res, serverContext, routeData))).then(r => {
            parameters = r;
            let actionResult = action.apply(controller, parameters);
            let p = actionResult as Promise<any>;
            if (p == null || p.then == null) {
                p = Promise.resolve(actionResult);
            }
            return p;
            // }).then((r) => {
            //     return outputResult(r, res, req, serverContext);
            // }).catch(err => {
            //     return outputError(err, res);
        }).finally(() => {
            for (let i = 0; i < parameterDecoders.length; i++) {
                let d = parameterDecoders[i]
                if (d.disposeParameter) {
                    d.disposeParameter(parameters[d.parameterIndex])
                }
            }
        })
    }
}