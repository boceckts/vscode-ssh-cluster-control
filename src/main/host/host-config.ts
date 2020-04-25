export interface HostsConfig {

    hosts: HostConfig[];

}

export interface HostConfig {

    host: string;
    user: string;
    identityFile: string;
    prefix: string;
    suffix: string;

}

export class DefaultHostsConfig implements HostsConfig {

    hosts: HostConfig[] = [];

}
