import { cogito } from "../cogito/mod.ts";

console.log(cogito.settings.get("language"));

cogito.settings.set("language", "english");

console.log(cogito.settings.get("language"));
