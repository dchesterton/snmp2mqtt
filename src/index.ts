import { createLogger, LogLevel } from "./log";
import { createClient } from "./mqtt";
import { Target } from "./snmp";
import { loadConfig } from "./config";
import { TargetConfig } from "./types";
import { createHomeAssistantTopics } from "./home_assistant";

const config = loadConfig();
const log = createLogger(config.log);

(async () => {
  const mqtt = await createClient(config.mqtt, log);

  if (config.homeassistant.discovery) {
    await createHomeAssistantTopics(
      mqtt,
      config.targets,
      config.homeassistant.prefix
    );
  }

  const publishSensors = async (
    values: Array<string | number | bigint | Error>,
    target: TargetConfig
  ) => {
    const promises: Array<Promise<any>> = [];

    for (const i in values) {
      const value = values[i];
      const sensor = target.sensors[i];

      if (value instanceof Error) {
        log(
          LogLevel.WARNING,
          `Error ${value.message} fetching sensor ${JSON.stringify(
            sensor
          )} from ${target.host}`
        );

        promises.push(
          mqtt.publish(mqtt.sensorStatusTopic(sensor, target), mqtt.OFFLINE)
        );
        return;
      }

      log(
        LogLevel.INFO,
        `[${target.host}] ${sensor.name}: ${value}${
          sensor.unit_of_measurement ? `${sensor.unit_of_measurement}` : ""
        }`
      );

      promises.push(
        mqtt.publish(mqtt.sensorValueTopic(sensor, target), value),
        mqtt.publish(mqtt.sensorStatusTopic(sensor, target), mqtt.ONLINE)
      );
    }

    await Promise.all(promises);
  };

  const clients: Target[] = [];

  for (const target of config.targets) {
    const client = new Target(target, log);
    client.on("response", publishSensors);
    client.connect();

    clients.push(client);
  }

  const pauseClients = () => {
    log(LogLevel.WARNING, "MQTT client disconnected");
    clients.forEach((client) => client.pause());
  }

  mqtt.on("close", pauseClients);

  mqtt.on("connect", () => {
    clients.forEach((client) => client.resume());
  });

  const exit = async (code: number = 0) => {
    log(LogLevel.INFO, "Exiting program...");
    mqtt.off("close", pauseClients);

    await mqtt.end();

    for (const client of clients) {
      await client.end();
    }

    process.exit(code);
  };

  process.on("SIGINT", async () => {
    log(LogLevel.INFO, "Caught interrupt signal, exiting gracefully...");
    await exit(0);
  });

  process.on("unhandledRejection", async (error) => {
    log(LogLevel.ERROR, `Unhandled rejection - ${error}`);
    await exit(1);
});
})();
