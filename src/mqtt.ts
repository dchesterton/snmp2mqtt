import { IClientOptions, connectAsync, AsyncMqttClient } from "async-mqtt";
import { MQTTConfig, SensorConfig, TargetConfig } from "./types";
import { readFileSync } from "fs";
import { slugify } from "./util";
import { Logger, LogLevel } from "./log";
import { EventEmitter } from "events";

const OFFLINE = "offline";
const ONLINE = "online";

const topics = {
  status: "snmp2mqtt/status",
};

const connect = (config: MQTTConfig) => {
  const port = config.port ? config.port : config.ca ? 8883 : 1883;

  const options: IClientOptions = {
    hostname: config.host,
    protocol: "mqtt",
    port,
    will: {
      topic: topics.status,
      payload: OFFLINE,
      retain: config.retain,
      qos: config.qos,
    },
  };

  if (config.username) {
    options.username = config.username;
  }

  if (config.password) {
    options.password = config.password;
  }

  if (config.client_id) {
    options.clientId = config.client_id;
  }

  if (config.keepalive) {
    options.keepalive = config.keepalive;
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

  options.reconnectPeriod = 5000;

  return connectAsync(options);
};

export const createClient = async (config: MQTTConfig, log: Logger) => {
  const emitter = new EventEmitter();

  let client: AsyncMqttClient = await connect(config);

  client.on("close", async () => {
    emitter.emit("close");
  });
  client.on("connect", async () => {
    emitter.emit("connect");
  });

  const publish = (
    topic: string,
    message: string | Record<string, unknown> | number | bigint
  ) => {
    if (!client.connected) {
      log(
        LogLevel.WARNING,
        `Skipping publish to ${topic}, MQTT connection closed`
      );
      return Promise.resolve(null);
    }
    const payload =
      typeof message === "object" ? JSON.stringify(message) : String(message);

    return client.publish(topic, payload, {
      qos: config.qos,
      retain: config.retain,
    });
  };

  await publish(topics.status, ONLINE);

  return {
    publish,
    sensorStatusTopic: (sensor: SensorConfig, target: TargetConfig) =>
      `snmp2mqtt/${target.host}/${slugify(sensor.name)}/status`,
    sensorValueTopic: (sensor: SensorConfig, target: TargetConfig) =>
      `snmp2mqtt/${target.host}/${slugify(sensor.name)}/value`,
    statusTopic: topics.status,
    ONLINE,
    OFFLINE,
    on: (event: "close" | "connect", cb: () => void) => emitter.on(event, cb),
    off: (event: "close" | "connect", cb: () => void) => emitter.off(event, cb),
    end: () => client.end(),
    qos: config.qos,
  };
};

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
export type Client = ThenArg<ReturnType<typeof createClient>>;
