const ENABLED_ENVIRONMENTS: ReadonlySet<string> = new Set(['development', 'test']);

/**
 * Whether developer-only routes (the component showcase) may be served. It fails closed: an
 * unknown or missing environment name counts as production, so the page can never appear by accident.
 */
export function isDevRouteEnabled(env: string | undefined): boolean {
  return env !== undefined && ENABLED_ENVIRONMENTS.has(env);
}
