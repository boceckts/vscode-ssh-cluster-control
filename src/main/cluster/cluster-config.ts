export const ID_CTRL_CLUSTER = 'ctrl.cluster';
export const ID_CTRL_CLUSTER_COMMANDS = "ctrl.cluster.commands";

export interface ClusterConfig {

    name: string;
    timeout: number;
    flavor: string;
    prefix: string;
    suffix: string;

}

export class DefaultClusterConfig implements ClusterConfig {

    name: string = "My Cluster";
    timeout: number = 5;
    flavor: string = "bash";
    prefix: string = "";
    suffix: string = "";

}
