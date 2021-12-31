export const schema = {
    $schema: "http://json-schema.org/draft-07/schema",
    $id: "https://github.com/dchesterton/snmp2mqtt/tree/master/src/config_schema.json",
    type: "object",
    definitions: {
        target: {
            type: "object",
            required: ["host", "sensors"],
            properties: {
                host: {
                    type: "string",
                },
                name: {
                    type: "string",
                },
                device_manufacturer: {
                    type: "string",
                },
                device_model: {
                    type: "string",
                },
                suggested_area: {
                    type: "string",
                },
                port: {
                    type: "number",
                },
                community: {
                    type: "string",
                },
                version: {
                    type: ["string", "number"],
                },
                scan_interval: {
                    type: "number",
                },
                username: {
                    type: "string",
                },
                auth_key: {
                    type: "string",
                },
                auth_protocol: {
                    type: "string",
                    enum: ["sha", "md5"],
                },
                priv_key: {
                    type: "string",
                },
                priv_protocol: {
                    type: "string",
                    enum: ["des", "aes", "aes256b", "aes256r"],
                },
                sensors: {
                    type: "array",
                    default: [],
                    items: { $ref: "#/definitions/sensor" },
                },
                user: {
                    type: "string",
                },
                level: {
                    type: "string",
                    enum: ["noAuthNoPriv", "authNoPriv", "authPriv"],
                },
            },
            additionalProperties: false,
        },
        sensor: {
            type: "object",
            required: ["oid", "name"],
            properties: {
                oid: {
                    type: "string",
                },
                name: {
                    type: "string",
                },
                transform: {
                    type: "string",
                },
                unit_of_measurement: {
                    type: "string",
                },
                device_class: {
                    type: "string",
                },
                icon: {
                    type: "string",
                },
                binary_sensor: {
                    type: "boolean",
                },
            },
            additionalProperties: false,
        },
    },
    properties: {
        mqtt: {
            type: "object",
            default: {},
            properties: {
                client_id: {
                    type: "string",
                    default: "snmp2mqtt",
                },
                host: {
                    type: "string",
                    default: "localhost",
                },
                port: {
                    type: "number",
                },
                keepalive: {
                    type: "number",
                    default: 10,
                },
                password: {
                    type: "string",
                    default: "",
                },
                qos: {
                    enum: [0, 1, 2],
                    type: "number",
                    default: 0,
                },
                retain: {
                    type: "boolean",
                    default: true,
                },
                username: {
                    type: "string",
                    default: "",
                },
                ca: {
                    type: "string",
                },
                cert: {
                    type: "string",
                },
                key: {
                    type: "string",
                },
                reject_unauthorized: {
                    type: "boolean",
                },
                clean: {
                    type: "boolean",
                    default: true,
                },
            },
            additionalProperties: false,
        },
        homeassistant: {
            type: "object",
            default: {},
            properties: {
                discovery: {
                    type: "boolean",
                    default: false,
                },
                prefix: {
                    type: "string",
                    default: "homeassistant",
                },
            },
            additionalProperties: false,
        },
        targets: {
            type: "array",
            default: [],
            items: { $ref: "#/definitions/target" },
        },
        log: {
            type: "string",
            enum: ["debug", "error", "info", "warning"],
            default: "info",
        },
    },
    additionalProperties: false,
};
