export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  console.log('API received submission', body);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}