import * as vscode from 'vscode';
import { StatusBar } from './status-bar';

export interface InfoChannel {

    name: string;

    sendOutput: (data: string, originator?: string) => void;
    sendError: (data: string, originator?: string) => void;
    sendCustomInfo: (type: string, data?: string, originator?: string) => void;
    showOutPut: () => void;
    destroy: (name: string) => void;

}

export class DefaultInfoChannel implements InfoChannel {

    statusBar: StatusBar;
    outputChannel: vscode.OutputChannel;
    name: string;

    constructor(name: string) {
        this.name = name;
        this.outputChannel = vscode.window.createOutputChannel('Cluster Ctrl (' + this.name + ')');
        this.outputChannel.show();
        this.statusBar = new StatusBar(name);
    }

    sendOutput(data: string, originator?: string): void {
        this.outputChannel.append(data);
        this.statusBar.sendText("output");
    };
    
    sendError(data: string, originator?: string): void {
        this.outputChannel.append(data);
        this.statusBar.sendText("error");
    };

    sendCustomInfo(type: string, data?: string, originator?: string): void {
        let _originator = originator === undefined ? this.name : originator;
        this.outputChannel.append("[" + _originator + "] -> " + type);
        if (data !== undefined) {
            this.outputChannel.appendLine(" '" + data + "'");
        } else {
            this.outputChannel.appendLine("");
        }
        this.statusBar.sendText(type);
    };

    showOutPut() {
        this.outputChannel.show();
    }

    destroy() {
        this.outputChannel.dispose();
        this.outputChannel.hide();
        this.statusBar.destroy();
    }

}