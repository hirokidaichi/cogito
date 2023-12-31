import { z, zodToJsonSchema } from "./deps.ts";

type ResultTuple<Result, Error> = [Result, null] | [null, Error];

const stripQuote = (text: string) => {
  return text.includes("```")
    ? text.trim().split(/```(?:json)?/)[1]
    : text.trim();
};

const isJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (_e) {
    return false;
  }
};

const parseJSON = (message: string) => {
  const text = stripQuote(message);
  if (!isJSON(text)) {
    return text;
  } else {
    return JSON.parse(text);
  }
};
export class Parser<Output> {
  constructor(
    public schema: z.ZodType<Output>,
  ) {
  }
  public instructions() {
    return `You must format your output as a JSON value that adheres to a given "JSON Schema" instance.

    "JSON Schema" is a declarative language that allows you to annotate and validate JSON documents.
    
    For example, the example "JSON Schema" instance {{"properties": {{"foo": {{"description": "a list of test words", "type": "array", "items": {{"type": "string"}}}}}}, "required": ["foo"]}}}}
    would match an object with one required property, "foo". The "type" property specifies "foo" must be an "array", and the "description" property semantically describes it as "a list of test words". The items within "foo" must be strings.
    Thus, the object {{"foo": ["bar", "baz"]}} is a well-formatted instance of this example "JSON Schema". The object {{"properties": {{"foo": ["bar", "baz"]}}}} is not well-formatted.
    
    Your output will be parsed and type-checked according to the provided schema instance, so make sure all fields in your output match the schema exactly and there are no trailing commas!
    
    Here is the JSON Schema instance your output must adhere to. Include the enclosing markdown codeblock:
    \`\`\`json
    ${JSON.stringify(zodToJsonSchema(this.schema))}
    \`\`\`
    `;
  }

  public async parse(text: string) {
    return await this.schema.safeParseAsync(parseJSON(text));
  }
}

