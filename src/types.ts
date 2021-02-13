import { LogLevelStrings } from "./log";

export enum Version {
  Version1 = "1",
  Version2c = "2c",
  Version3 = "3",
}

export enum SecurityLevel {
  NoAuthNoPriv = "noAuthNoPriv",
  AuthNoPriv = "authNoPriv",
  AuthPriv = "authPriv",
}

export interface MQTTConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  retain: boolean;
  qos: 0 | 1 | 2;
  client_id?: string;
  keepalive?: number;
  ca?: string;
  cert?: string;
  key?: string;
}

export interface TargetConfig {
  host: string;
  name?: string;
  device_manufacturer?: string;
  device_model?: string;
  community: string;
  version: Version;
  sensors: SensorConfig[];
  port: number;
  scan_interval: number;
  user: string;
  level: SecurityLevel;
  auth_protocol: "md5" | "sha";
  auth_key?: string;
  priv_protocol?: "des" | "aes";
  priv_key?: string;
}

export interface SensorConfig {
  oid: string;
  name: string;
  transform?: string;
  unit_of_measurement?: string;
  device_class?: string;
  icon?: string;
  binary_sensor?: boolean;
}

export interface Config {
  log: LogLevelStrings;
  mqtt: MQTTConfig;
  homeassistant: HomeAssistantConfig;
  targets: Array<TargetConfig>;
}

export interface HomeAssistantConfig {
  discovery: boolean;
  prefix: string;
}
