export function GET() {
  return Response.json({ status: 'ok', service: 'one-second', mode: 'demo' }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
