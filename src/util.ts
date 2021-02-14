import slugifyFn from "slugify";
import { createHash } from "crypto";

export function slugify(str: string) {
  return slugifyFn(str.toLowerCase().replace("-", "_").replace("~", "_"), {
    replacement: "_",
    strict: true,
  }).replace(/^_+|_+$/g, "");
}

export const md5 = (str: string) => createHash("md5").update(str).digest("hex");
