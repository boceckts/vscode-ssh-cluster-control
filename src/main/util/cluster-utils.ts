import * as vscode from 'vscode';
import { ClusterConfig, ID_CTRL_CLUSTER } from "../cluster/cluster-config";
import { InfoChannel } from "../info-channel";
import { Cluster, DefaultCluster } from "../cluster/cluster";
import { Host, DefaultHost } from "../host/host";
import { HostsConfig, DefaultHostsConfig } from "../host/host-config";
import { CommandBuilder } from '../command/command';

export function createCluster(config: ClusterConfig, infoChannel: InfoChannel): Cluster {
    CommandBuilder.configureforCluster(config);
    let hosts: Host[] = createRemoteHosts(infoChannel);
    return new DefaultCluster(config, hosts, infoChannel);
}

export function createRemoteHosts(infoChannel: InfoChannel): Host[] {
    let config: HostsConfig | undefined = vscode.workspace.getConfiguration().get(ID_CTRL_CLUSTER);
    let hostsConfig: HostsConfig = config === undefined ? new DefaultHostsConfig() : config;
    let hosts: Host[] = [];
    let index = 0;
    hostsConfig.hosts?.forEach(conf => {
        index++;
        hosts.push(new DefaultHost(index, conf, infoChannel));
    });
    return hosts;
}