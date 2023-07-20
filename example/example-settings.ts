import { cogito } from "../mod.ts";

console.log(cogito.settings.get("language"));

cogito.settings.set("language", "english");

console.log(cogito.settings.get("language"));
