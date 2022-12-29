import { IClientOptions, connectAsync, AsyncMqttClient } from "async-mqtt";
import { MQTTConfig, SensorConfig, TargetConfig } from "./types";
import { readFileSync } from "fs";
import { slugify } from "./util";
import { Logger } from "./log";
import { EventEmitter } from "events";

const OFFLINE = "offline";
const ONLINE = "online";

const STATUS_TOPIC = "snmp2mqtt/status";
const CONFIG_TOPIC = "snmp2mqtt/config";

const connect = (config: MQTTConfig) => {
    const port = config.port ? config.port : config.ca ? 8883 : 1883;

    const options: IClientOptions = {
        hostname: config.host,
        protocol: "mqtt",
        port,
        will: {
            topic: STATUS_TOPIC,
            payload: OFFLINE,
            retain: config.retain,
            qos: config.qos,
        },
        clientId: config.client_id,
        clean: config.clean,
        keepalive: config.keepalive,
        reconnectPeriod: 5000,
        rejectUnauthorized: config.reject_unauthorized,
    };

    console.log(config);

    if (config.username) {
        options.username = config.username;
    }

    if (config.password) {
        options.password = config.password;
    }

    if (config.ca) {
        options.ca = readFileSync(config.ca);
        options.protocol = "mqtts";
    }

    if (config.cert) {
        options.cert = readFileSync(config.cert);
        options.protocol = "mqtts";
    }

    if (config.key) {
        options.key = readFileSync(config.key);
        options.protocol = "mqtts";
    }

    return connectAsync(options);
};

export const createClient = async (
    config: MQTTConfig,
    log: Logger,
    version: string
) => {
    const emitter = new EventEmitter();

    let client: AsyncMqttClient = await connect(config);

    const publish = (
        topic: string,
        message: string | Record<string, unknown> | number | bigint
    ) => {
        if (!client.connected) {
            log.warning(`Skipping publish to ${topic}, MQTT connection closed`);
            return Promise.resolve(null);
        }
        const payload =
            typeof message === "object"
                ? JSON.stringify(message)
                : String(message);

        log.debug(
            `Writing to ${topic} (QOS: ${config.qos}, retain: ${
                config.retain ? "true" : "false"
            })`
        );

        return client.publish(topic, payload, {
            qos: config.qos,
            retain: config.retain,
        });
    };

    const onConnect = async () => {
        await publish(STATUS_TOPIC, ONLINE);
        await publish(CONFIG_TOPIC, { version });
        emitter.emit("connect");
    };

    client.on("close", async () => {
        emitter.emit("close");
    });

    client.on("connect", onConnect);

    await onConnect();

    return {
        publish,
        sensorStatusTopic: (sensor: SensorConfig, target: TargetConfig) =>
            `${config.base_topic}/${target.host}/${slugify(sensor.name)}/status`,
        sensorValueTopic: (sensor: SensorConfig, target: TargetConfig) =>
            `${config.base_topic}/${target.host}/${slugify(sensor.name)}/value`,
        STATUS_TOPIC,
        ONLINE,
        OFFLINE,
        on: (event: "close" | "connect", cb: () => void) =>
            emitter.on(event, cb),
        off: (event: "close" | "connect", cb: () => void) =>
            emitter.off(event, cb),
        end: async () => {
            await client.publish(STATUS_TOPIC, OFFLINE);
            await client.end();
        },
        qos: config.qos,
    };
};

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
export type Client = ThenArg<ReturnType<typeof createClient>>;
