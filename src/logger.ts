// deno-lint-ignore-file no-explicit-any
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.1/ansi/mod.ts";

const INFO = colors.bold.underline.bgBrightBlue("[INFO]");
const DEBUG = colors.bold.underline.bgBrightGreen("[DEBUG]");
const WARN = colors.bold.underline.bgBrightYellow("[WARN]");
const ERROR = colors.bold.underline.bgBrightRed("[ERROR]");
const FATAL = colors.bold.underline.bgRed("[FATAL]");

const LEVEL = (level: LogLevel) => {
  if (level === "info") return INFO;
  if (level === "debug") return DEBUG;
  if (level === "warn") return WARN;
  if (level === "error") return ERROR;
  if (level === "fatal") return FATAL;
  throw new Error(`Unknown log level: ${level}`);
};
const FUNC_NAME = (name: string) => {
  return colors.bold.underline.rgb24(name, 0x3333ff);
};

const REQUEST = colors.bgBrightMagenta("(request)");
const RESPONSE = colors.bgBrightCyan("(response)");
const CODE = colors.bgBrightGreen("(code)");
const CLASS = (cls?: string) => {
  return colors.bgBrightYellow(`(${cls || "(anonymous)"})`);
};
type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

type FuncRequestLog = {
  level: "info";
  type: "request";
  name: string;
  input: any;
};
type FuncResponseLog = {
  level: "info";
  type: "response";
  name: string;
  input: any;
  output: any;
};

type ProgrammerCodeLog = {
  level: "debug";
  type: "code";
  name: string;
  code: string;
};

type MessageLog = {
  type: "message";
  message: string;
  class?: string;
};
type DebugLog = {
  level: "debug";
} & MessageLog;
type WarningLog = {
  level: "warn";
} & MessageLog;
type ErrorLog = {
  level: "error";
} & MessageLog;

type FatalLog = {
  level: "fatal";
} & MessageLog;

type LogRecord =
  | FuncRequestLog
  | FuncResponseLog
  | ProgrammerCodeLog
  | DebugLog
  | WarningLog
  | ErrorLog
  | FatalLog;

type InfoLevelLog = Extract<LogRecord, { level: "info" }>;
type DebugLevelLog = Extract<LogRecord, { level: "debug" }>;
type WarnLevelLog = Extract<LogRecord, { level: "warn" }>;
type ErrorLevelLog = Extract<LogRecord, { level: "error" }>;
type FatalLevelLog = Extract<LogRecord, { level: "fatal" }>;

export class Logger {
  constructor(
    public verbose: boolean = true,
    public loglevel: LogLevel[] = ["info", "debug", "warn", "error", "fatal"],
    public records: LogRecord[] = [],
  ) {}
  public emit(record: LogRecord) {
    if (!this.verbose) return;
    if (!this.loglevel.includes(record.level)) return;
    if (record.level == "info") {
      return this.emitInfo(record);
    }
    if (record.level == "debug") {
      return this.emitDebug(record);
    }
    if (record.level == "warn") {
      return this.emitWarn(record);
    }
    if (record.level == "error") {
      return this.emitError(record);
    }
    if (record.level == "fatal") {
      return this.emitFatal(record);
    }
  }
  public emitDebug(record: DebugLevelLog) {
    const level = LEVEL(record.level);
    if (record.type === "code") {
      const name = FUNC_NAME(record.name);
      console.log(level, CODE, name, record.code);
      return;
    } else {
      console.log(level, CLASS(record.class), record.message);
    }
  }

  public emitFatal(_record: FatalLevelLog) {
    /*const level = LEVEL(record.level);
    const name = FUNC_NAME(record.name);
    console.log(level, name, record.message);*/
  }
  public emitError(_record: ErrorLevelLog) {
    /*const level = LEVEL(record.level);
    const name = FUNC_NAME(record.name);
    console.log(level, name, record.message);*/
  }
  public emitWarn(record: WarnLevelLog) {
    const level = LEVEL(record.level);
    console.warn(level, record.message);
  }
  public emitInfo(record: InfoLevelLog) {
    const level = LEVEL(record.level);

    const name = FUNC_NAME(record.name);
    if (record.type === "request") {
      console.log(level, REQUEST, name, "\n", record.input);
    }
    if (record.type === "response") {
      console.log(level, RESPONSE, name, "\n", {
        input: record.input,
        output: record.output,
      });
    }
  }
  public warn(message: string, cls?: string) {
    this.log({ level: "warn", type: "message", message, class: cls });
  }
  public debug(message: string, cls?: string) {
    this.log({ level: "debug", type: "message", message, class: cls });
  }
  public error(message: string, cls?: string) {
    this.log({ level: "error", type: "message", message, class: cls });
  }
  public fatal(message: string, cls?: string) {
    this.log({ level: "fatal", type: "message", message, class: cls });
  }

  public log(record: LogRecord) {
    logger.emit(record);
    this.records.push(record);
  }
  public save(path: string) {
    Deno.writeTextFileSync(path, JSON.stringify(this.records, null, 2));
  }
}

export let logger = new Logger();
export const setLogger = (givenLogger: Logger) => {
  logger = givenLogger;
};
