// API 프록시 핸들러
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Proxies a POST request to an external API, forwarding the authorization header and handling both JSON and multipart form data bodies.
 *
 * Forwards the request to the target API endpoint constructed from the provided path segments. Handles error responses by attempting to parse and return error details from the proxied API, or returns a generic error message if parsing fails.
 *
 * @param request - The incoming Next.js request object
 * @param params - An object containing a promise that resolves to the path segments for the proxied API endpoint
 * @returns A JSON response from the proxied API, or an error response with appropriate status and details
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: pathArray } = await params;
    const path = pathArray.join('/');
    // API_BASE_URL 끝에 슬래시가 있고 path 시작에도 슬래시가 올 수 있으므로 중복 제거
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const url = `${API_BASE_URL}${cleanPath}`;

    // Authorization 헤더만 복사
    const headers: Record<string, string> = {};
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    let body: any;
    const contentType = request.headers.get('content-type');

    // FormData인지 JSON인지 판단
    if (contentType?.includes('multipart/form-data') || contentType === null) {
      // FormData 처리 (이미지 업로드)
      body = await request.formData();
    } else {
      // JSON 처리
      body = await request.text();
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('프록시 API 에러:', response.status, errorText);

      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(errorData, { status: response.status });
      } catch {
        return NextResponse.json({ error: errorText }, { status: response.status });
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('프록시 에러:', error);
    return NextResponse.json(
      {
        error: '프록시 요청 실패',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * Proxies a GET request to an external API, forwarding the path, query parameters, and authorization header.
 *
 * Constructs the target URL from the provided path segments and query parameters, sends the GET request with the authorization header if present, and returns the proxied API's JSON response. Handles and returns error responses from the external API or internal errors with appropriate status codes.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: pathArray } = await params;
    const path = pathArray.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    // API_BASE_URL 끝에 슬래시가 있고 path 시작에도 슬래시가 올 수 있으므로 중복 제거
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const url = `${API_BASE_URL}${cleanPath}${searchParams ? `?${searchParams}` : ''}`;

    // Authorization 헤더만 복사
    const headers: Record<string, string> = {};
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('프록시 GET API 에러:', response.status, errorText);

      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(errorData, { status: response.status });
      } catch {
        return NextResponse.json({ error: errorText }, { status: response.status });
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('프록시 GET 에러:', error);
    return NextResponse.json(
      {
        error: '프록시 GET 요청 실패',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
