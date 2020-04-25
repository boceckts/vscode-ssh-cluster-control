import { ClusterConfig } from "./cluster-config";
import { Host } from "../host/host";
import { InfoChannel } from "../info-channel";
import { StatusMessage } from "../status/status-message";
import { Status } from "../status/status";

export interface Cluster {

    name: string;
    timeout: number;
    flavor: string;
    prefix: string;
    suffix: string;
    hosts: Host[];
    status: Status;
    commandBeingExecuted: string;
    infoChannel: InfoChannel;

    showConfig: () => void;

    onNodeFinished: (node: number) => void;

    executeOnHosts: (command: string) => Promise<StatusMessage[]>;

    stopExecutionOnHosts: () => void;

}

export class DefaultCluster implements Cluster {

    name: string;
    timeout: number;
    flavor: string;
    prefix: string;
    suffix: string;
    hosts: Host[];
    status: Status;
    commandBeingExecuted: string;
    infoChannel: InfoChannel;
    onNodeFinished: (node: number) => void = () => { return; };

    constructor(config: ClusterConfig, hosts: Host[], infoChannel: InfoChannel) {
        this.name = config.name;
        this.timeout = config.timeout;
        this.flavor = config.flavor;
        this.prefix = config.prefix;
        this.suffix = config.suffix;
        this.hosts = hosts;
        this.infoChannel = infoChannel;
        this.status = hosts.length === 0 ? this.status = Status.NO_HOSTS : Status.OK;
        this.commandBeingExecuted = '';
    }

    public async executeOnHosts(command: string): Promise<StatusMessage[]> {
        this.makeBusy(command);
        let promises: Promise<StatusMessage>[] = [];
        this.infoChannel.sendCustomInfo("command", command);
        for (let index = 0; index < this.hosts.length; index++) {
            promises.push(this.hosts[index].execute(command).then((result) => {
                this.onNodeFinished(index + 1);
                return result;
            }));
        }
        return Promise.all(promises).then((result) => {
            this.makeReady(Status.OK);
            return result;
        });
    }

    public stopExecutionOnHosts() {
        this.hosts.forEach(host => {
            host.stopExecution();
        });
        this.makeReady(Status.ABORTED);
    }

    public showConfig() {
        let data = 'name: ' + this.name;
        data += ', timeout: ' + this.timeout;
        data += ', flavor: ' + this.flavor;
        data += ', prefix: ' + this.prefix;
        data += ', suffix: ' + this.suffix;
        this.infoChannel.sendCustomInfo("configuration", data);
        this.hosts.forEach(host => {
            host.showConfig();
        });
    }

    public makeReady(status: Status) {
        this.status = status;
        this.commandBeingExecuted = '';
    }

    public makeBusy(command: string) {
        this.status = Status.BUSY;
        this.commandBeingExecuted = command;
    }

}