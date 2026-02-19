export type FetchMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchApiOptions {
  method?: FetchMethod;
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
  queryParams?: Record<string, string | number>;
}

function getBaseUrl() {
  // In the browser, use relative URLs (empty string)
  if (typeof window !== 'undefined') return '';
  // On the server at Vercel, use VERCEL_URL which is always set
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // Local dev fallback
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
}

const API_KEY = process.env.API_KEY || '';


export async function fetchApi<T = any>({
  method = "GET",
  endpoint,
  body,
  headers = {},
  queryParams,
}: FetchApiOptions): Promise<T> {
  let url = `${getBaseUrl()}${endpoint}`;

  if (queryParams) {
    const searchParams = new URLSearchParams(
      Object.entries(queryParams).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    url += `?${searchParams}`;
  }

  const isJson =
    headers["Content-Type"] === "application/json" || !headers["Content-Type"];

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...headers,
    },
    body:
      body && method !== "GET"
        ? isJson
          ? JSON.stringify(body)
          : body
        : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error ${response.status}: ${error}`);
  }

  return response.json();
}
