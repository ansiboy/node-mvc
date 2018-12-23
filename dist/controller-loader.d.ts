export declare class ControllerLoader {
    private actions;
    constructor(controller_directories: string[], root_path: string);
    private joinPaths;
    private getControllerPaths;
    private loadController;
    getAction(virtualPath: string): Function;
}
