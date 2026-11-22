export interface DriftResult { missing: string[]; extra: string[]; empty: string[]; ok: boolean }
export function parseEnv(text: string): Record<string, string>;
export function compare(
  expected: Record<string, string>,
  actual: Record<string, string | undefined>,
  options?: { ignore?: string[] }
): DriftResult;
export function checkDrift(options?: {
  example?: string; env?: string; useProcessEnv?: boolean; ignore?: string[]; cwd?: string;
}): DriftResult;
