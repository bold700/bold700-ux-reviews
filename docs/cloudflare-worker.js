// ═══════════════════════════════════════════════════════════
// BOLD700 UX Review — Cloudflare Worker Proxy
// ═══════════════════════════════════════════════════════════
// Dual-purpose proxy:
// 1. POST /         → OpenAI Chat Completions API (for AI Actieplan)
// 2. GET  /fetch?url=... → Page fetcher (for Auto-Scan)
//
// De frontend stuurt een Anthropic-stijl request (system + messages met
// tekst/afbeelding-blokken). Deze worker vertaalt dat naar OpenAI en
// vertaalt het antwoord terug, zodat de frontend ongewijzigd blijft.
//
// Setup:
// 1. Deploy this worker to Cloudflare Workers
// 2. Add your OpenAI API key as a secret:
//    wrangler secret put OPENAI_API_KEY
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

    // ── POST / → OpenAI Chat Completions API proxy ──
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Model dat we bij OpenAI gebruiken. gpt-4o-mini is goedkoop én
    // ondersteunt vision (afbeeldingen). Zet op 'gpt-4o' voor hogere kwaliteit.
    const OPENAI_MODEL = 'gpt-4o-mini';

    try {
      const body = await request.json();

      // ── Vertaal Anthropic-stijl request → OpenAI Chat Completions ──
      const messages = [];
      if (body.system) messages.push({ role: 'system', content: body.system });

      for (const msg of (body.messages || [])) {
        let content = msg.content;
        if (Array.isArray(content)) {
          content = content.map((block) => {
            if (block.type === 'text') return { type: 'text', text: block.text };
            if (block.type === 'image' && block.source?.type === 'base64') {
              return {
                type: 'image_url',
                image_url: { url: `data:${block.source.media_type};base64,${block.source.data}` },
              };
            }
            if (block.type === 'image_url') return block; // al OpenAI-stijl
            return { type: 'text', text: '' };
          });
        }
        messages.push({ role: msg.role, content });
      }

      const openaiBody = {
        model: OPENAI_MODEL,
        max_tokens: body.max_tokens || 2000,
        messages,
      };

      const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(openaiBody),
      });

      const data = await openaiResp.json();

      if (!openaiResp.ok) {
        return new Response(JSON.stringify({ error: data.error || { message: 'OpenAI API fout' } }), {
          status: openaiResp.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── Vertaal OpenAI-antwoord → Anthropic-stijl { content: [{ type, text }] } ──
      const text = data.choices?.[0]?.message?.content || '';
      return new Response(JSON.stringify({ content: [{ type: 'text', text }] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: { message: err.message } }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
