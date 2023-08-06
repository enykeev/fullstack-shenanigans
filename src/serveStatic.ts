import type { Context, Next } from 'hono'
import { getFilePath } from 'hono/utils/filepath'
import { getMimeType } from 'hono/utils/mime'

export type ServeStaticOptions = {
  root?: string
  path?: string
  rewriteRequestPath?: (path: string) => string
}

const DEFAULT_DOCUMENT = 'index.html'

export const serveStatic = (options: ServeStaticOptions = { root: '' }) => {
  return async (c: Context, next: Next) => {
    // Do nothing if Response is already set
    if (c.finalized) {
      await next()
      return
    }
    const url = new URL(c.req.url)

    const filename = options.path ?? decodeURI(url.pathname)
    let path = getFilePath({
      filename: options.rewriteRequestPath ? options.rewriteRequestPath(filename) : filename,
      root: options.root,
      defaultDocument: DEFAULT_DOCUMENT,
    })

    if (!path) return await next()

    path = `./${path}`

    const content = Bun.file(path)
    if (await content.exists()) {
      const mimeType = getMimeType(path)
      if (mimeType) {
        c.header('Content-Type', mimeType)
      }
      return c.body(content.stream())
    }
    await next()
    return
  }
}