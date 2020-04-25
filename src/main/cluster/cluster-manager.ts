import * as vscode from 'vscode';
import { createCluster } from '../util/cluster-utils';
import { ClusterConfig } from './cluster-config';
import { Cluster } from './cluster';
import { Status } from "../status/status";
import { DefaultInfoChannel } from '../info-channel';
import { StatusMessage, StatusMessageBuilder } from '../status/status-message';
import { CommandMap } from '../command/command-map';

export interface ClusterManager {

    updateCluster: (clusterConfig: ClusterConfig, commandMap: CommandMap) => void;

    getClusterStatusMessage: () => StatusMessage;

    executeCommandFromMap: (key: string) => void;

    executeCommand: (command: string) => void;

    openTerminalsForCluster: () => void;

    showClusterConfiguration: () => void;

    openClusterOutput: () => void;

}

export class DefaultClusterManager implements ClusterManager {

    cluster: Cluster;
    commands: CommandMap;

    constructor(clusterConfig: ClusterConfig, commands: CommandMap) {
        this.cluster = createCluster(clusterConfig, new DefaultInfoChannel(clusterConfig.name));
        this.commands = commands;
    }

    updateCluster(clusterConfig: ClusterConfig, commands: CommandMap) {
        this.cluster.infoChannel.destroy(clusterConfig.name);
        this.cluster = createCluster(clusterConfig, new DefaultInfoChannel(clusterConfig.name));
        this.commands = commands;
    }

    openTerminalsForCluster() {
        this.cluster.hosts.forEach(host => {
            let index = vscode.window.terminals.map(t => t.name).indexOf(host.host);
            if (index > 0) {
                vscode.window.terminals[index].show();
            } else {
                let term = vscode.window.createTerminal(host.host);
                term.sendText(host.commandBuilder.build().getConnectionString());
                term.show();
            }
        });
    }

    showClusterConfiguration() {
        this.cluster.showConfig();
    }

    openClusterOutput() {
        this.cluster.infoChannel.showOutPut();
    }

    getClusterStatusMessage() {
        let message;
        switch (this.cluster.status) {
            case Status.BUSY:
                message = new StatusMessageBuilder()
                    .status(this.cluster.status)
                    .content("The '" + this.cluster.name +
                        "' Cluster is still busy executing the Command '" + this.cluster.commandBeingExecuted +
                        "'. Please wait until the command execution has been finished.")
                    .build();
                break;
            case Status.NO_HOSTS:
                message = new StatusMessageBuilder()
                    .status(this.cluster.status)
                    .content("There are no Hosts defined for the '" + this.cluster.name +
                        "' Cluster. Please add new host definitions in the settings.")
                    .build();
                break;
            default:
                message = new StatusMessageBuilder().build();
        }
        return message;
    }

    executeCommandFromMap(key: string) {
        let commandIndex = Object.keys(this.commands).indexOf(key);
        switch (this.cluster.flavor) {
            case 'bash':
                this.executeCommand(Object.values(this.commands)[commandIndex].bash);
                break;
            case 'cmd':
                this.executeCommand(Object.values(this.commands)[commandIndex].cmd);
                break;
            case 'pwsh':
                this.executeCommand(Object.values(this.commands)[commandIndex].pwsh);
                break;
        }
    }

    executeCommand(command: string) {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running Command '" + command + "' on '" + this.cluster.name + "' Cluster",
            cancellable: true
        }, (progress, token) => {
            token.onCancellationRequested(() => {
                this.cluster.stopExecutionOnHosts();
            });

            this.cluster.onNodeFinished = (node) => {
                return progress.report({ increment: 100 / this.cluster.hosts.length });
            };

            var clusterCommandPromise = this.cluster.executeOnHosts(command);

            clusterCommandPromise.then(
                (results) => {
                    this.evaluateMessages(results, command);
                    return results;
                }
            );

            return clusterCommandPromise;
        });
    }

    evaluateMessages(messages: StatusMessage[], command: string) {
        let overAllStatus!: Status;
        let nodes = '';
        messages.forEach((message: StatusMessage) => {
            if (message.status === Status.ERROR) {
                overAllStatus = message.status;
                nodes += message.content + ' ';
            } else if (![Status.ABORTED, Status.ERROR].includes(overAllStatus)) {
                overAllStatus = message.status;
            }
        });
        switch (overAllStatus) {
            case Status.OK:
                vscode.window.showInformationMessage("Successfully executed the Command '" + command + "' on the '" + this.cluster.name + "' Cluster.");
                break;
            case Status.ABORTED:
                vscode.window.showWarningMessage("Execution of the Command '" + command + "' has been aborted.");
                break;
            case Status.ERROR:
                vscode.window.showErrorMessage("There was an error during the execution of the Command '" + command + "' on the node(s) [" + nodes.trim() + "] of the '" + this.cluster.name + "' Cluster.");
                break;
            default:
                vscode.window.showErrorMessage('Something went wrong!');
        }

    }

}