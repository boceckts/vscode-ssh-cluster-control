import { ClusterConfig } from "../cluster/cluster-config";
import { HostConfig } from "../host/host-config";

export interface Command {

    getConnectionString: () => string;

    getCommandString: () => string;

}

export class DefaultCommand implements Command {

    connectionString: string;
    commandString: string;

    constructor(connectionString: string, commandString: string) {
        this.connectionString = connectionString;
        this.commandString = commandString;
    }

    getConnectionString() {
        return this.connectionString;
    }

    getCommandString() {
        return this.commandString;
    }

}

export class CommandBuilder {

    static clusterConfig: ClusterConfig | undefined;

    sshTimeout: number = 0;
    flavor: string = '';
    clusterPrefix: string = '';
    clusterSuffix: string = '';

    host: string = '';
    user: string = '';
    identityFile: string = '';
    hostPrefix: string = '';
    hostSuffix: string = '';

    commandToExecute: string = '';


    static configureforCluster(config: ClusterConfig) {
        this.clusterConfig = config;
    }

    static of(hostConfig: HostConfig): CommandBuilder {
        let cb: CommandBuilder = new CommandBuilder();
        if (CommandBuilder.clusterConfig) {
            cb.sshTimeout = CommandBuilder.clusterConfig.timeout;
            cb.flavor = CommandBuilder.clusterConfig.flavor;
            cb.clusterPrefix = CommandBuilder.clusterConfig.prefix;
            cb.clusterSuffix = CommandBuilder.clusterConfig.suffix;
        }
        cb.host = hostConfig.host;
        cb.user = hostConfig.user;
        cb.identityFile = hostConfig.identityFile;
        cb.hostPrefix = hostConfig.prefix;
        cb.hostSuffix = hostConfig.suffix;
        return cb;
    }

    command(commandToExecute: string): CommandBuilder {
        this.commandToExecute = commandToExecute;
        return this;
    }

    build(): Command {
        let connection: string = 'ssh ';
        connection += '-o ConnectTimeout=' + this.sshTimeout + ' ';
        connection += '-o "StrictHostKeyChecking=no" ';
        connection += this.getIdentityFileString();
        connection += this.getHostString();
        let command: string = connection + '';
        command += '"';
        command += this.getClusterCommandPrefix();
        command += this.getHostCommandPrefix();
        command += this.commandToExecute;
        command += this.getClusterCommandSuffix();
        command += this.getHostCommandSuffix();
        command += '"';
        return new DefaultCommand(connection, command);
    }

    getIdentityFileString(): string {
        return (this.identityFile) ? '-i ' + this.identityFile + ' ' : '';
    }


    getHostString(): string {
        let hostName = (this.user && this.user.trim()) ? this.user + '@' : '';
        hostName += this.host + ' ';
        return hostName;
    }

    getClusterCommandPrefix(): string {
        return (this.clusterPrefix && this.clusterPrefix.trim()) ? this.clusterPrefix : '';
    }

    getHostCommandPrefix(): string {
        return (this.hostPrefix && this.hostPrefix.trim()) ? this.hostPrefix : '';
    }

    getClusterCommandSuffix(): string {
        return (this.clusterSuffix && this.clusterSuffix.trim()) ? this.clusterSuffix : '';
    }

    getHostCommandSuffix(): string {
        return (this.hostSuffix && this.hostSuffix.trim()) ? this.hostSuffix : '';
    }

}