export function apiError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function unavailable() {
  // Do not return database errors, connection strings, or stack traces to callers.
  return apiError(503, 'SERVICE_UNAVAILABLE', 'Catalogue is temporarily unavailable.');
}
