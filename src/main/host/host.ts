import { HostConfig } from "./host-config";
import { InfoChannel } from "../info-channel";
import { CommandBuilder } from "../command/command";
import { Status } from "../status/status";
import { StatusMessageBuilder, StatusMessage } from "../status/status-message";

export interface Host {

    nodeId: number;
    host: string;
    user: string;
    identityFile: string;
    prefix: string;
    suffix: string;
    status: Status;
    process: any;
    infoChannel: InfoChannel;
    commandBuilder: CommandBuilder;

    showConfig: () => void;

    execute: (command: string) => Promise<StatusMessage>;

    stopExecution: () => void;

}

export class DefaultHost implements Host {

    nodeId: number;
    host: string;
    user: string;
    identityFile: string;
    prefix: string;
    suffix: string;
    status: Status;
    process: any;
    infoChannel: InfoChannel;
    commandBuilder: CommandBuilder;

    constructor(id: number, config: HostConfig, infoChannel: InfoChannel) {
        this.nodeId = id;
        this.host = config.host;
        this.user = config.user;
        this.identityFile = config.identityFile;
        this.prefix = config.prefix;
        this.suffix = config.suffix;
        this.infoChannel = infoChannel;
        this.commandBuilder = CommandBuilder.of(config);
        this.status = Status.OK;
    }

    public execute(command: string): Promise<StatusMessage> {
        let p = new Promise<StatusMessage>((resolve, reject) => {
            if (this.isReady()) {
                this.status = Status.BUSY;
                
                let exec = require('child_process').exec;
                let commandString = this.commandBuilder.command(command).build().getCommandString();
                console.log(commandString);
                this.process = exec(commandString);
                this.process.stdout.on('data', (data: string) => {
                    this.infoChannel.sendOutput(data, this.host);
                });

                this.process.stderr.on('data', (data: string) => {
                    this.infoChannel.sendError(data, this.host);
                    this.status = Status.ERROR;
                });

                this.process.on('close', (code: string) => {
                    this.infoChannel.sendCustomInfo("finished", undefined, this.host);
                    if (this.status === Status.BUSY) {
                        this.status = Status.OK;
                    }
                    resolve(this.createMessage(this.host));
                });
            } else {
                resolve(this.createMessage(this.host));
            }
        });
        return p;
    }

    public stopExecution() {
        if (this.status !== Status.OK) {
            this.status = Status.ABORTED;
            this.infoChannel.sendCustomInfo("abort", undefined, this.host);
            let kill = require('tree-kill');
            return kill(this.process.pid);
        }
    }

    public showConfig() {
        let data = 'host: ' + this.host;
        data += ', user: ' + this.user;
        data += ', identityFile: ' + this.identityFile;
        data += ', prefix: ' + this.prefix;
        data += ', suffix: ' + this.suffix;
        this.infoChannel.sendCustomInfo("configuration", data, this.host);
    }

    public isReady() {
        return [Status.OK, Status.ERROR, Status.ABORTED].includes(this.status);
    }

    createMessage(message: string) {
        return new StatusMessageBuilder().status(this.status).content(message).build();
    }

}