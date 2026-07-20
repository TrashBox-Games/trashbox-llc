import { CodeBlock } from "@/components/molecules/CodeBlock";
import {
  SUBMISSIONS_API_AUTH,
  SUBMISSIONS_API_ENDPOINTS,
  buildCurlExample,
  type ApiEndpoint,
  type HttpMethod,
} from "@/lib/api-docs";
import { API_BASE_URL, API_DOCS_URL } from "@/lib/sites";

const METHOD_CLASS: Record<HttpMethod, string> = {
  GET: "text-[#7EB6D4] border-[#7EB6D4]/40",
  POST: "text-[#8FCB8F] border-[#8FCB8F]/40",
  PATCH: "text-[#D4B87E] border-[#D4B87E]/40",
  DELETE: "text-error border-error/40",
};

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span
      className={`inline-block border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${METHOD_CLASS[method]}`}
    >
      {method}
    </span>
  );
}

function EndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  return (
    <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <MethodBadge method={endpoint.method} />
        <code className="break-all font-mono text-sm text-white">
          {endpoint.path}
        </code>
      </div>

      <h3 className="mt-4 font-headline text-xl font-bold text-white">
        {endpoint.summary}
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
        {endpoint.description}
      </p>

      {endpoint.parameters.length > 0 && (
        <div className="mt-6">
          <p className="font-label text-[10px] uppercase tracking-widest text-outline">
            Parameters
          </p>
          <ul className="mt-3 space-y-2">
            {endpoint.parameters.map((param) => (
              <li key={param.name} className="text-sm text-on-surface-variant">
                <code className="font-mono text-white">{param.name}</code>
                <span className="ml-2 text-xs text-outline">
                  {param.in}
                  {param.required ? " · required" : ""} · {param.type}
                </span>
                <span className="block text-xs text-on-surface-variant/80">
                  {param.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <CodeBlock
          language="curl"
          code={buildCurlExample(endpoint, API_BASE_URL)}
        />
        {endpoint.requestBody && (
          <CodeBlock language="request · json" code={endpoint.requestBody} />
        )}
        <CodeBlock
          language={`response · ${endpoint.responseStatus} · json`}
          code={endpoint.responseExample}
        />
      </div>
    </section>
  );
}

/** In-app API reference for the form submission (leads) endpoints. */
export function ApiDocsSettings() {
  return (
    <div className="space-y-6">
      <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
        <p className="font-label text-[10px] uppercase tracking-widest text-outline">
          Submissions API
        </p>
        <h2 className="mt-3 font-headline text-2xl font-bold text-white md:text-3xl">
          Form submissions endpoints
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
          Programmatic access to your leads under{" "}
          <code className="text-white">/submissions</code>. Base URL{" "}
          <code className="text-white">{API_BASE_URL}</code>. For the full
          reference, see the{" "}
          <a
            href={API_DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="text-white underline-offset-4 hover:underline"
          >
            OpenAPI docs
          </a>
          .
        </p>

        <div className="mt-6">
          <p className="font-label text-[10px] uppercase tracking-widest text-outline">
            Authentication
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            {SUBMISSIONS_API_AUTH}
          </p>
        </div>
      </section>

      {SUBMISSIONS_API_ENDPOINTS.map((endpoint) => (
        <EndpointCard key={endpoint.id} endpoint={endpoint} />
      ))}
    </div>
  );
}
