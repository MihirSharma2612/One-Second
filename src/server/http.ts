export function apiError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function safeCatalogDiagnostic(error: unknown) {
  const details = error !== null && typeof error === 'object'
    ? error as Record<string, unknown> : {};
  const allowedNames = new Set([
    'PrismaClientInitializationError', 'PrismaClientKnownRequestError',
    'PrismaClientUnknownRequestError', 'PrismaClientValidationError',
    'PrismaClientRustPanicError',
  ]);
  const type = typeof details.name === 'string' && allowedNames.has(details.name)
    ? details.name : 'UnknownError';
  const code = [details.errorCode, details.code].find(value =>
    typeof value === 'string' && /^P\d{4}$/.test(value));
  // Never include message, stack, meta, query, URL, or arbitrary error properties.
  return { event: 'catalogue_request_failed', type, code: code ?? 'UNKNOWN' };
}

export function unavailable(error: unknown) {
  console.error(JSON.stringify(safeCatalogDiagnostic(error)));
  // Do not return database errors, connection strings, or stack traces to callers.
  return apiError(503, 'SERVICE_UNAVAILABLE', 'Catalogue is temporarily unavailable.');
}
