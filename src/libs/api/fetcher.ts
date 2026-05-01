export class HttpError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

type FetcherInit = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function fetcher<TResponse>(
  input: string,
  init?: FetcherInit,
): Promise<TResponse> {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && init?.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    ...init,
    headers,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  const payload = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      (isJson &&
        payload &&
        typeof payload === "object" &&
        "message" in payload &&
        typeof (payload as { message?: string }).message === "string" &&
        (payload as { message: string }).message) ||
      "Request failed";

    throw new HttpError(message, response.status, payload);
  }

  return payload as TResponse;
}
