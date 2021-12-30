import Ajv from "ajv";
import betterAjvErrors from "better-ajv-errors";
import * as fs from "fs";
import { JSON_SCHEMA, load } from "js-yaml";

import { schema } from "./config_schema";
import { createLogger } from "./log";
import { Config } from "./types";

export function loadConfig(): Config {
    const yamlConfig = loadYamlConfig();

    if (yamlConfig) {
        return validate(yamlConfig);
    }

    throw new Error("Could not find config file");
}

function validate(userConfig: unknown) {
    const ajv = new Ajv({
        allowUnionTypes: true,
        useDefaults: true,
        allErrors: true,
    });

    const validator = ajv.compile<Config>(schema);

    if (!validator(userConfig)) {
        const errors = betterAjvErrors(schema, userConfig, validator.errors!, {
            format: "js",
        });

        if (errors && errors.length) {
            const log = createLogger("ERROR");

            log.error(
                `${errors.length} error${
                    errors.length > 1 ? "s" : ""
                } found in config...`
            );
            for (const error of errors) {
                log.error(error.error);
            }

            process.exit(1);
        }
    }

    return userConfig as Config;
}

function loadYamlConfig() {
    const fileName = `${process.cwd()}/config.yml`;

    if (!fs.existsSync(fileName)) {
        return false;
    }

    try {
        return load(fs.readFileSync(fileName, "utf8"), {
            schema: JSON_SCHEMA,
        });
    } catch (e) {
        throw new Error(`Error loading config file: ${e}`);
    }
}
