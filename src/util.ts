import slugifyFn from "slugify";
import { createHash } from "crypto";

export function slugify(str: string) {
  return slugifyFn(str.toLowerCase().replace("-", "_"), {
    replacement: "_",
    remove: /[*+~.()'"!;?:@[\]{}/^#=,`]/g,
  });
}

export const md5 = (str: string) => createHash("md5").update(str).digest("hex");
