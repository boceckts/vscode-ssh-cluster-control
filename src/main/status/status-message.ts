import { Status } from "./status";


export interface StatusMessage {

    readonly status: Status;
    readonly content: string;

}

export class StatusMessageBuilder {

    _status: Status;
    _content: string;

    constructor() {
        this._status = Status.UNKNOWN;
        this._content = '';
    }

    status(status: Status): StatusMessageBuilder {
        this._status = status;
        return this;
    }

    content(content: string): StatusMessageBuilder {
        this._content = content;
        return this;
    }

    build(): StatusMessage {
        return {
            status: this._status,
            content: this._content
        };
    }

}