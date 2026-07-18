// src/lib/api.ts
// Resolves correct backend communications for both Tauri environment and standalone Web mode.

import { invoke } from '@tauri-apps/api/core';

// Check if running inside Tauri context
const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined;

export async function getApiBase(): Promise<string> {
  // Not strictly needed in Tauri commands mode, but kept for standalone web backend configuration
  return '';
}

/**
 * Intercepts calls when running inside Tauri and invokes Rust commands, 
 * otherwise routes to standard fetch relative path for standalone web mode.
 */
export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  if (isTauri) {
    if (endpoint === '/api/health') {
      try {
        const hasKey = await invoke<boolean>('has_api_key');
        const key = await invoke<string>('get_api_key');
        return new Response(
          JSON.stringify({
            status: "ok",
            hasKey,
            keyLength: key ? key.length : 0,
          }), 
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || err }), { status: 500 });
      }
    }

    if (endpoint === '/api/advisor') {
      try {
        const bodyObj = JSON.parse(options?.body as string || '{}');
        const result = await invoke<any>('call_advisor', { 
          prompt: bodyObj.prompt, 
          model: bodyObj.model || null 
        });
        return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || err }), { status: 500 });
      }
    }

    if (endpoint === '/api/social-reply') {
      try {
        const bodyObj = JSON.parse(options?.body as string || '{}');
        const result = await invoke<any>('call_social_reply', {
          postContent: bodyObj.postContent,
          tone: bodyObj.tone,
          companyName: bodyObj.companyName,
          hypeLevel: Number(bodyObj.hypeLevel || 0),
          sentiment: Number(bodyObj.sentiment || 0),
          pastPosts: bodyObj.pastPosts || [],
        });
        return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || err }), { status: 500 });
      }
    }
    if (endpoint === '/api/generate-reply') {
      try {
        const bodyObj = JSON.parse(options?.body as string || '{}');
        const result = await invoke<any>('generate_user_reply', {
          draftIntent: bodyObj.draftIntent,
          originalPost: bodyObj.originalPost,
          tone: bodyObj.tone,
          model: bodyObj.model || null
        });
        return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || err }), { status: 500 });
      }
    }
    if (endpoint === '/api/social-feed') {
      try {
        const bodyObj = JSON.parse(options?.body as string || '{}');
        const result = await invoke<any>('generate_social_feed', {
          companyName: bodyObj.companyName,
          sentiment: Number(bodyObj.sentiment || 0),
          hypeLevel: Number(bodyObj.hypeLevel || 0),
          count: Number(bodyObj.count || 3)
        });
        return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || err }), { status: 500 });
      }
    }
  }

  // Standalone web mode fallback: relative fetch directly to running Express app
  return fetch(endpoint, options);
}
