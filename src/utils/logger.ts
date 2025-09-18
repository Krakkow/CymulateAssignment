/**
 * A simple logger utility for consistent log formatting.
 * Example usage:
 *   const log = new Logger("LoginPage");
 *   log.step("Filling login form");
 *   log.info("Email entered");
 */

export type LogLevel = "INFO" | "WARN" | "ERROR" | "STEP";

export class Logger {
  private readonly scope: string;

  constructor(scope: string) {
    this.scope = scope;
  }

  /** Internal formatter for consistent prefix */
  private prefix(level: LogLevel): string {
    const t = new Date().toISOString();
    return `[${t}] [${level}] [${this.scope}]`;
  }

  info(msg: string): void {
    console.log(`${this.prefix("INFO")} ${msg}`);
  }

  warn(msg: string): void {
    console.warn(`${this.prefix("WARN")} ${msg}`);
  }

  error(msg: string): void {
    console.error(`${this.prefix("ERROR")} ${msg}`);
  }

  step(msg: string): void {
    console.log(`${this.prefix("STEP")} ➜ ${msg}`);
  }
}
