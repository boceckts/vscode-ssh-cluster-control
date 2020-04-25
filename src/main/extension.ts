// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ClusterConfig, DefaultClusterConfig, ID_CTRL_CLUSTER_COMMANDS, ID_CTRL_CLUSTER } from './cluster/cluster-config';
import { DefaultClusterManager, ClusterManager } from './cluster/cluster-manager';
import { Status } from "./status/status";
import { CommandMap, DefaultCommandMap } from './command/command-map';

let manager: ClusterManager;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	update();

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.showClusterConfiguration', () => {
		manager.showClusterConfiguration();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.showClusterOutput', () => {
		manager.openClusterOutput();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.executeCustomCommand', () => {
		if (evaluateClusterStatus()) {
			vscode.window.showInputBox({
				ignoreFocusOut: true,
				placeHolder: "echo 'Hello World from Cluster Ctrl'",
				prompt: "Type the Command that you want to be executed on your Cluster.",
				validateInput: (val) => {return val ? '' :'Command can not be empty';}
			}).then(command => {
				if (command) {
					manager.executeCommand(command);
				}
			});
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.executeSelectionAsCommand', () => {
		let commandSelection = vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor?.selection);
		if (commandSelection) {
			if (evaluateClusterStatus()) {
				manager.executeCommand(commandSelection);
			}
		} else {
			let message = 'Selection is empty, please select the text to be executed on the Cluster and run the Command again.';
			vscode.window.showInformationMessage(message);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.openTerminals', () => {
		if (evaluateClusterStatus()) {
			manager.openTerminalsForCluster();
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.shutdownCluster', () => {
		evaluateClusterStatusAndExecuteCommandFromMap('shutdown');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.restartCluster', () => {
		evaluateClusterStatusAndExecuteCommandFromMap('restart');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.showSystemInfo', () => {
		evaluateClusterStatusAndExecuteCommandFromMap('systemInfo');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.showHardwareInfo', () => {
		evaluateClusterStatusAndExecuteCommandFromMap('hardwareInfo');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.showProcessList', () => {
		evaluateClusterStatusAndExecuteCommandFromMap('processList');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.showMemory', () => {
		evaluateClusterStatusAndExecuteCommandFromMap('memory');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.showDate', () => {
		evaluateClusterStatusAndExecuteCommandFromMap('date');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.showPorts', () => {
		evaluateClusterStatusAndExecuteCommandFromMap('ports');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.showWorkingDirectory', () => {
		evaluateClusterStatusAndExecuteCommandFromMap('workingDirectory');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.showFiles', () => {
		evaluateClusterStatusAndExecuteCommandFromMap('listFiles');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.showHostname', () => {
		evaluateClusterStatusAndExecuteCommandFromMap('hostname');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ssh-cluster-control.showNetworkConfiguration', () => {
		evaluateClusterStatusAndExecuteCommandFromMap('networkConfiguration');
	}));

	vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
		if (e.affectsConfiguration(ID_CTRL_CLUSTER)) {
			update();
		}
	});

}

// this method is called when your extension is deactivated
export function deactivate() { }

function update() {
	let config: ClusterConfig | undefined = vscode.workspace.getConfiguration().get(ID_CTRL_CLUSTER);
	let clusterConfig: ClusterConfig = config === undefined ? new DefaultClusterConfig() : config;
	let map: CommandMap | undefined = vscode.workspace.getConfiguration().get(ID_CTRL_CLUSTER_COMMANDS);
	if (!map) {
		map = new DefaultCommandMap();
	}
	if (manager !== undefined) {
		manager.updateCluster(clusterConfig, map);
	} else {
		manager = new DefaultClusterManager(clusterConfig, map);
	}
	console.log('updated configuration');
	console.log(clusterConfig);
}

function evaluateClusterStatusAndExecuteCommandFromMap(key: string) {
	if (evaluateClusterStatus()) {
		manager.executeCommandFromMap(key);
	}
}

function evaluateClusterStatus(): boolean {
	let message = manager.getClusterStatusMessage();
	let pass = true;
	switch (message.status) {
		case Status.NO_HOSTS:
			vscode.window.showInformationMessage(message.content);
			pass = false;
			break;
		case Status.BUSY:
			vscode.window.showWarningMessage(message.content);
			pass = false;
			break;
		default:
	}
	return pass;
}
