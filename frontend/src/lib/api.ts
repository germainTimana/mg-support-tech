import { uiLogger } from './ui-logger';

const API_URL =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000/api';

export interface BackendError {
  statusCode: number;
  error: string;
  message: string;
  traceId?: string;
  details?: unknown;
}

export class BackendRequestError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly traceId?: string;
  public readonly details?: unknown;

  constructor(payload: BackendError) {
    super(payload.message);
    this.name = 'BackendRequestError';
    this.status = payload.statusCode;
    this.code = payload.error;
    this.traceId = payload.traceId;
    this.details = payload.details;
  }
}

function isBackendError(data: unknown): data is BackendError {
  return (
    typeof data === 'object' &&
    data !== null &&
    'statusCode' in data &&
    'error' in data &&
    'message' in data
  );
}

export async function backendFetch(
  path: string,
  options: RequestInit = {},
  token?: string,
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  uiLogger.debug(`Solicitud ${options.method || 'GET'} ${path}`, { scope: 'api', url: path });

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      cache: 'no-store',
    });
  } catch (networkErr) {
    uiLogger.error('Fallo de red al contactar el backend', {
      scope: 'api',
      url: path,
      reason: networkErr instanceof Error ? networkErr.message : String(networkErr),
    });
    throw new BackendRequestError({
      statusCode: 0,
      error: 'NETWORK_ERROR',
      message: 'No se pudo conectar con el servidor',
    });
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (isBackendError(data)) {
      const err = new BackendRequestError(data);
      uiLogger.error(`Respuesta errónea del backend: ${data.error}`, {
        scope: 'api',
        url: path,
        status: data.statusCode,
        code: data.error,
        traceId: data.traceId,
        message: data.message,
      });
      throw err;
    }
    const fallback: BackendError = {
      statusCode: res.status,
      error: 'UNKNOWN_ERROR',
      message: Array.isArray((data as { message?: unknown }).message)
        ? ((data as { message: string[] }).message.join(', '))
        : ((data as { message?: string }).message || 'Error en la solicitud'),
    };
    uiLogger.error('Respuesta errónea sin cuerpo de error estructurado', {
      scope: 'api',
      url: path,
      status: res.status,
    });
    throw new BackendRequestError(fallback);
  }

  uiLogger.debug('Respuesta exitosa del backend', {
    scope: 'api',
    url: path,
    status: res.status,
  });
  return data;
}

export { API_URL };
