import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type MarkdownDocumentProps = {
  markdown: string
  className?: string
}

const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-2 font-headline text-4xl font-bold tracking-tighter text-primary md:text-5xl">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-12 mb-4 border-b border-outline-variant/30 pb-2 font-headline text-2xl font-bold tracking-tight text-primary first:mt-0 md:text-3xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 font-headline text-lg font-semibold tracking-tight text-primary md:text-xl">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-4 text-base leading-relaxed text-on-surface-variant last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-on-background">{children}</strong>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  ul: ({ className, children }) => {
    const cls = String(className ?? '')
    return (
      <ul className={`mb-4 space-y-2 text-on-surface-variant ${cls.includes('contains-task-list') ? 'list-none pl-0' : 'list-disc pl-6'}`}>
        {children}
      </ul>
    )
  },
  ol: ({ children }) => <ol className="mb-4 list-decimal space-y-2 pl-6 text-on-surface-variant">{children}</ol>,
  li: ({ className, children }) => {
    const cls = String(className ?? '')
    return (
      <li className={`leading-relaxed ${cls.includes('task-list-item') ? 'flex items-start gap-2' : 'marker:text-outline'}`}>
        {children}
      </li>
    )
  },
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-primary/60 bg-surface-container-low/80 py-4 pl-5 pr-4 text-on-surface-variant [&_p]:mb-2 [&_p:last-child]:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-0 border-t border-outline-variant/40" />,
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-outline-variant/30 bg-surface-container-low/40">
      <table className="w-full min-w-[20rem] border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-outline-variant/40 bg-surface-container-high/60">{children}</thead>,
  th: ({ children }) => (
    <th className="px-4 py-3 font-headline text-xs font-bold uppercase tracking-wider text-primary">{children}</th>
  ),
  td: ({ children }) => <td className="border-t border-outline-variant/20 px-4 py-3 text-on-surface-variant">{children}</td>,
  tr: ({ children }) => <tr className="transition-colors hover:bg-white/2">{children}</tr>,
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes('language-')
    if (isBlock) {
      return (
        <code className={`${className ?? ''} block overflow-x-auto rounded-md bg-surface-container-high p-4 text-sm`} {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-[0.9em] text-primary" {...props}>
        {children}
      </code>
    )
  },
  pre: ({ children }) => <pre className="my-4 overflow-x-auto rounded-lg border border-outline-variant/30">{children}</pre>,
  input: ({ type, checked, ...props }) => {
    if (type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="mr-2 mt-0.5 h-4 w-4 shrink-0 rounded border-outline-variant accent-primary"
          {...props}
        />
      )
    }
    return <input type={type} {...props} />
  },
}

export function MarkdownDocument({ markdown, className = '' }: MarkdownDocumentProps) {
  return (
    <article className={`markdown-document ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {markdown}
      </ReactMarkdown>
    </article>
  )
}
