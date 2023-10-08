import slugifyFn from "slugify";
import { createHash } from "crypto";

export function slugify(str: string) {
    return slugifyFn(
        str.toLowerCase().replaceAll("-", "_").replaceAll("~", "_"),
        {
            replacement: "_",
            strict: true,
        }
    ).replace(/^_+|_+$/g, "");
}

export function nodify(str: string) {
    return str.replaceAll(/[^a-zA-Z0-9_-]/g, '_')
}

export const md5 = (str: string) => createHash("md5").update(str).digest("hex");
