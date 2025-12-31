import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight: (code, language) => {
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(code, { language }).value
      } catch {
        return hljs.highlightAuto(code).value
      }
    }
    return hljs.highlightAuto(code).value
  }
})

const renderFence = (content: string, language: string) => {
  const highlighted = markdown.options.highlight
    ? markdown.options.highlight(content, language, '')
    : markdown.utils.escapeHtml(content)
  const langClass = language ? ` language-${markdown.utils.escapeHtml(language)}` : ''
  return `<pre class="hljs"><code class="hljs${langClass}">${highlighted}</code></pre>`
}

markdown.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx]
  const info = token.info ? token.info.trim().split(/\s+/g)[0] : ''
  return renderFence(token.content, info)
}

markdown.renderer.rules.code_block = (tokens, idx) => {
  const token = tokens[idx]
  return renderFence(token.content, '')
}

const defaultLinkOpen =
  markdown.renderer.rules.link_open ||
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  token.attrSet('target', '_blank')
  token.attrSet('rel', 'noopener noreferrer')
  token.attrJoin('class', 'font-medium underline decoration-amber-400/60')
  return defaultLinkOpen(tokens, idx, options, env, self)
}

markdown.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const next = tokens[idx + 1]
  if (next && next.type === 'inline') {
    const slug = slugify(next.content)
    if (slug) {
      token.attrSet('id', slug)
    }
  }
  token.attrJoin('class', 'scroll-mt-24')
  return self.renderToken(tokens, idx, options)
}

markdown.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
  tokens[idx].attrJoin('class', 'rounded-md bg-amber-100/70 px-1 py-0.5')
  return self.renderToken(tokens, idx, options)
}

markdown.renderer.rules.table_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrJoin('class', 'table-auto')
  return self.renderToken(tokens, idx, options)
}

export const renderMarkdown = (content: string) => {
  if (!content) return ''
  return markdown.render(content)
}
