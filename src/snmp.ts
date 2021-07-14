import * as snmp from "net-snmp";

import { TargetConfig, VersionConfig } from "./types";
import { EventEmitter } from "events";
import { Logger } from "./log";
import { toBigIntBE } from "bigint-buffer";

const versionToNetSnmp = (version?: VersionConfig) => {
    switch (version) {
        case "2c":
            return snmp.Version2c as number;
        case 3:
        case "3":
            return snmp.Version3 as number;
        default:
            return snmp.Version1 as number;
    }
};

export declare interface Target {
    on(
        event: "response",
        listener: (
            values: Array<string | number | bigint>,
            target: TargetConfig
        ) => void
    ): this;
}

export class Target extends EventEmitter {
    private session: any;
    private interval?: NodeJS.Timer;
    private ending: boolean = false;

    public constructor(private options: TargetConfig, private log: Logger) {
        super();
    }

    public pause() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    public resume() {
        this.interval = setInterval(() => {
            this.fetch();
        }, this.getScanInterval());

        this.fetch();
    }

    public end() {
        this.ending = true;

        return new Promise<void>((res) => {
            this.session.on("close", () => {
                res();
            });
            this.session.close();
        });
    }

    private getScanInterval() {
        return (this.options.scan_interval ?? 10) * 1000;
    }

    public connect() {
        const scanIntervalMs = this.getScanInterval();

        const options: any = {
            port: this.options.port ?? 161,
            retries: 3,
            timeout: scanIntervalMs > 5000 ? 5000 : scanIntervalMs / 2,
            backoff: 1.0,
            version: versionToNetSnmp(this.options.version),
        };

        if (options.version === snmp.Version3) {
            const user: any = {
                name: this.options.username,
            };

            if (this.options.auth_key && this.options.priv_key) {
                user.level = snmp.SecurityLevel.authPriv;
            } else if (this.options.auth_key && !this.options.priv_key) {
                user.level = snmp.SecurityLevel.authNoPriv;
            } else {
                user.level = snmp.SecurityLevel.noAuthNoPriv;
            }

            if (this.options.auth_protocol) {
                user.authProtocol =
                    snmp.AuthProtocols[this.options.auth_protocol];
            }
            if (this.options.auth_key) {
                user.authKey = this.options.auth_key;
            }

            if (this.options.priv_protocol) {
                user.privProtocol =
                    snmp.PrivProtocols[this.options.priv_protocol];
            }
            if (this.options.priv_key) {
                user.privKey = this.options.priv_key;
            }

            this.session = snmp.createV3Session(
                this.options.host,
                user,
                options
            );
        } else {
            const community = this.options.community ?? "public";
            this.session = snmp.createSession(
                this.options.host,
                community,
                options
            );
        }

        this.session.on("close", () => {
            if (this.ending) {
                return;
            }

            this.log.warning(`Target ${this.options.host} disconnected`);
            this.pause();

            setTimeout(() => {
                this.connect();
            }, 2000);
        });

        this.resume();
    }

    public close() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    private fetch() {
        const oids = this.options.sensors.map((sensor) => sensor.oid);

        this.log.debug(
            `Fetching ${oids.length} sensors from ${this.options.host}...`
        );

        this.session.get(
            oids,
            (error: Error, varbinds: Array<{ value: string | number }>) => {
                if (error) {
                    const errors = [];

                    for (let i = 0; i < oids.length; i++) {
                        errors.push(error);
                    }

                    this.emit("response", errors, this.options);
                } else {
                    const values = [];

                    for (const i in this.options.sensors) {
                        const sensor = this.options.sensors[i];
                        const result = varbinds[i];

                        if (snmp.isVarbindError(result)) {
                            values.push(snmp.varbindError(result));
                        } else {
                            let { value, type } = result as {
                                value: string | number | Buffer | bigint;
                                type: any;
                            };

                            switch (type) {
                                case snmp.ObjectType.Counter64:
                                    value = toBigIntBE(value as Buffer);
                                    break;
                                case snmp.ObjectType.OctetString:
                                    value = value.toString();
                                    break;
                            }

                            if (sensor.transform) {
                                value = eval(sensor.transform);
                            }

                            values.push(value);
                        }
                    }

                    this.emit("response", values, this.options);
                }
            }
        );
    }
}
