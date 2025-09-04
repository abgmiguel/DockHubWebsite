import { API_URL } from '../../../shared/lib/api-config';

export const prerender = false;

export async function POST({ request }: { request: Request }) {
  const database = request.headers.get('X-Site-Database') || 'codersinflow';
  const body = await request.json();
  
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Site-Database': database
    },
    body: JSON.stringify(body)
  });
  
  const data = await response.text();
  
  // Forward the response headers (including cookies)
  const headers = new Headers();
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      headers.append(key, value);
    }
  });
  headers.set('Content-Type', response.headers.get('Content-Type') || 'text/plain');
  
  return new Response(data, {
    status: response.status,
    headers
  });
}