import { API_URL } from '../../../shared/lib/api-config';

export const prerender = false;

export async function POST({ request }: { request: Request }) {
  const database = request.headers.get('X-Site-Database') || 'codersinflow';
  const body = await request.json();
  
  const response = await fetch(`${API_URL}/api/auth/create-admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Site-Database': database
    },
    body: JSON.stringify(body)
  });
  
  return new Response(await response.text(), {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json'
    }
  });
}