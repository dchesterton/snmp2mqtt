import { createLogger, LogLevel } from "./log";
import { createClient } from "./mqtt";
import { Target } from "./snmp";
import { loadConfig } from "./config";
import { SensorConfig, TargetConfig } from "./types";
import { createHomeAssistantTopics } from "./home_assistant";

const config = loadConfig();
const log = createLogger(config.log);

(async () => {
  const mqtt = await createClient(config.mqtt);

  if (config.homeassistant.discovery) {
    await createHomeAssistantTopics(
      mqtt,
      config.targets,
      config.homeassistant.prefix
    );
  }

  const publishSensor = async (
    value: string | number,
    sensor: SensorConfig,
    target: TargetConfig
  ) => {
    log(
      LogLevel.INFO,
      `[${target.host}] ${sensor.name}: ${value}${
        sensor.unit_of_measurement ? `${sensor.unit_of_measurement}` : ""
      }`
    );

    await Promise.all([
      await mqtt.publish(mqtt.sensorValueTopic(sensor, target), value),
      await mqtt.publish(mqtt.sensorStatusTopic(sensor, target), mqtt.ONLINE),
    ]);
  };

  for (const target of config.targets) {
    const client = new Target(target, log);
    client.on("error", async (error, sensor, target) => {
      log(
        LogLevel.WARNING,
        `Error ${error.message} fetching sensor ${JSON.stringify(
          sensor
        )} from ${target.host}`
      );
      await mqtt.publish(mqtt.sensorStatusTopic(sensor, target), mqtt.OFFLINE);
    });
    client.on("response", publishSensor);
    client.connect();
  }

  // todo: handle interrupts
})();
