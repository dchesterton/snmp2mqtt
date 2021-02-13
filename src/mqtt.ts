import { IClientOptions, connectAsync } from "async-mqtt";
import { MQTTConfig, SensorConfig, TargetConfig } from "./types";
import { readFileSync } from "fs";
import { slugify } from "./util";

const OFFLINE = "offline";
const ONLINE = "online";

const topics = {
  status: "snmp2mqtt/status",
};

const connect = (config: MQTTConfig) => {
  const options: IClientOptions = {
    hostname: config.host,
    protocol: "mqtt",
    port: config.port,
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

  return connectAsync(options);
};

export const createClient = async (config: MQTTConfig) => {
  let client = await connect(config);
  client.on("close", async () => {
    // client = undefined;
    // client = await connect(config);
  });

  const publish = (
    topic: string,
    message: string | Record<string, unknown> | number | bigint
  ) => {
    if (!client) {
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
  };
};

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
export type Client = ThenArg<ReturnType<typeof createClient>>;
