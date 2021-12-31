import { Client } from "./mqtt";
import { TargetConfig } from "./types";
import { md5, slugify } from "./util";

export const createHomeAssistantTopics = async (
    mqtt: Client,
    targets: Array<TargetConfig>,
    prefix: string
) => {
    const promises = [];

    for (const target of targets) {
        const device: any = {
            name: target.name ?? target.host,
            identifiers: target.host,
            via_device: "snmp2mqtt",
        };

        if (target.suggested_area) {
            device.suggested_area = target.suggested_area;
        }
        if (target.device_manufacturer) {
            device.manufacturer = target.device_manufacturer;
        }
        if (target.device_model) {
            device.model = target.device_model;
        }

        for (const sensor of target.sensors) {
            const sensorType = sensor.binary_sensor
                ? "binary_sensor"
                : "sensor";
            const sensorName = slugify(sensor.name);
            const topic = `${prefix}/${sensorType}/snmp2mqtt/${sensorName}/config`;

            const discovery: any = {
                availability: [
                    {
                        topic: mqtt.STATUS_TOPIC,
                    },
                    {
                        topic: mqtt.sensorStatusTopic(sensor, target),
                    },
                ],
                availability_mode: "all",
                device,
                name: sensor.name,
                unique_id: `snmp2mqtt.${md5(`${target.host}-${sensor.oid}`)}`,
                state_topic: mqtt.sensorValueTopic(sensor, target),
                qos: mqtt.qos,
                entity_category: "diagnostic",
            };

            if (sensor.unit_of_measurement) {
                discovery.unit_of_measurement = sensor.unit_of_measurement;
            }
            if (sensor.device_class) {
                discovery.device_class = sensor.device_class;
            }
            if (sensor.icon) {
                discovery.icon = sensor.icon;
            }

            promises.push(mqtt.publish(topic, discovery));
        }
    }

    await Promise.all(promises);
};
