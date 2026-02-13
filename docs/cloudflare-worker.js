// ═══════════════════════════════════════════════════════════
// BOLD700 UX Review — Cloudflare Worker Proxy
// ═══════════════════════════════════════════════════════════
// Dual-purpose proxy:
// 1. POST /         → Anthropic AI API (for AI Actieplan)
// 2. GET  /fetch?url=... → Page fetcher (for Auto-Scan)
//
// Setup:
// 1. Deploy this worker to Cloudflare Workers
// 2. Add your Anthropic API key as a secret:
//    wrangler secret put ANTHROPIC_API_KEY
// 3. Set the worker URL in the BOLD700 admin panel (Platform Instellingen)
// ═══════════════════════════════════════════════════════════

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // ── GET /fetch?url=... → Page fetcher for Auto-Scan ──
    if (request.method === 'GET' && url.pathname === '/fetch') {
      const targetUrl = url.searchParams.get('url');
      if (!targetUrl) {
        return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        const pageResp = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
          },
          redirect: 'follow',
        });

        const html = await pageResp.text();

        return new Response(html, {
          status: pageResp.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/html; charset=utf-8',
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── POST / → Anthropic AI API proxy ──
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = await request.json();

      const anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });

      const result = await anthropicResp.text();

      return new Response(result, {
        status: anthropicResp.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
