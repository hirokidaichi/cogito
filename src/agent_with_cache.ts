import { crypto } from "https://deno.land/std@0.193.0/crypto/mod.ts";
import { encode } from "https://deno.land/std@0.193.0/encoding/base64.ts";

import { Agent } from "./agent.ts";

const digest = async (info: string) => {
  const buff = await crypto.subtle.digest(
    "SHA-384",
    new TextEncoder().encode(info),
  );
  return encode(buff);
};

export class AgentWithCache extends Agent {
  public messageDigest() {
    return digest(JSON.stringify(this.messages));
  }

  public async guessMessage() {
    const res = await this.guess();
    const choice = res.data.choices[0];
    return choice.message;
  }
  public async chat(message?: string) {
    if (message) {
      this.addUserMessage(message);
    }
    const messageDigest = await this.messageDigest();
    console.log(messageDigest);
    //@ts-ignore Deno.openKv
    const kv = await Deno.openKv();
    const { value } = await kv.get([messageDigest]);
    console.log(value);
    if (value) {
      this.appendMessage(value);
      return value;
    }
    const resMessage = await this.guessMessage();
    kv.set([messageDigest], resMessage);

    if (resMessage) {
      this.appendMessage(resMessage);
    }
    return resMessage;
  }
  static create() {
    return new AgentWithCache();
  }
}
