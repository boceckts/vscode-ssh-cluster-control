import * as vscode from 'vscode';

export class StatusBar {

    statusBar: vscode.StatusBarItem;
    name: string;

    constructor(name: string) {
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
        this.statusBar.command = 'vscode-ssh-cluster-control.showClusterOutput';
        this.name = name;
        this.statusBar.show();
    }

    destroy() {
        this.statusBar.dispose();
        this.statusBar.hide();
    }

    sendText(text: string) {
        if (text === 'error') {
            this.statusBar.text = '$(alert) ' + this.name;
            this.statusBar.tooltip = 'Cluster Command Error';
        } else if (text === 'output') {
            this.statusBar.text = '$(terminal) ' + this.name;
            this.statusBar.tooltip = 'Cluster Command Output';
        } else if (text === 'command') {
            this.statusBar.text = '$(terminal) ' + this.name;
            this.statusBar.tooltip = 'Cluster Command Running';
        } else if (text === 'finished') {
            this.statusBar.text = '$(verified) ' + this.name;
            this.statusBar.tooltip = 'Cluster is ready';
        } else if (text === 'configuration') {
            this.statusBar.text = '$(gear) ' + this.name;
            this.statusBar.tooltip = 'Cluster Configuration';
        } else {
            this.statusBar.text = '$(unverified) ' + this.name;
            this.statusBar.tooltip = 'Cluster Ctrl Unknown State';
        }
    }

}