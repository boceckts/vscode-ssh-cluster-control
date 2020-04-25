export interface CommandMap {

    shutdown: CommandMapping;
    restart: CommandMapping;
    systemInfo: CommandMapping;
    hardwareInfo: CommandMapping;
    processList: CommandMapping;
    memory: CommandMapping;
    date: CommandMapping;
    ports: CommandMapping;
    workingDirectory: CommandMapping;
    listFiles: CommandMapping;
    hostname: CommandMapping;
    networkConfiguration: CommandMapping;

}

export class DefaultCommandMap implements CommandMap {

    shutdown: CommandMapping = new DefaultCommandMapping();
    restart: CommandMapping = new DefaultCommandMapping();
    systemInfo: CommandMapping = new DefaultCommandMapping();
    hardwareInfo: CommandMapping = new DefaultCommandMapping();
    processList: CommandMapping = new DefaultCommandMapping();
    memory: CommandMapping = new DefaultCommandMapping();
    date: CommandMapping = new DefaultCommandMapping();
    ports: CommandMapping = new DefaultCommandMapping();
    workingDirectory: CommandMapping = new DefaultCommandMapping();
    listFiles: CommandMapping = new DefaultCommandMapping();
    hostname: CommandMapping = new DefaultCommandMapping();
    networkConfiguration: CommandMapping = new DefaultCommandMapping();

}

export interface CommandMapping {

    bash: string;
    cmd: string;
    pwsh: string;

}

export class DefaultCommandMapping implements CommandMapping {

    bash: string = 'undefined';
    cmd: string = 'undefined';
    pwsh: string = 'undefined';

}
