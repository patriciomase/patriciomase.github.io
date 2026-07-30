import { codeToHast } from "shiki";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

/** Grammars worth bundling. Anything else renders as plain text. */
const LANGUAGES = new Set([
  "bash",
  "sh",
  "shell",
  "json",
  "ts",
  "tsx",
  "js",
  "jsx",
  "css",
  "html",
  "sql",
  "python",
  "yaml",
  "diff",
]);

/**
 * A highlighted code block.
 *
 * An async Server Component: Shiki tokenises on the server, so no highlighter
 * and no grammars reach the browser -- the client receives finished markup.
 * Output goes through `toJsxRuntime` rather than `dangerouslySetInnerHTML`,
 * keeping the whole article tree real React elements.
 */
export async function CodeBlock({
  code,
  lang,
}: {
  code: string;
  lang?: string;
}) {
  const language = lang && LANGUAGES.has(lang) ? lang : "text";

  const hast = await codeToHast(code, {
    lang: language,
    theme: "github-dark-default",
    transformers: [
      {
        pre(node) {
          // Shiki paints its own background inline, which would override the
          // gradient the site uses for code blocks. Token colours stay.
          delete node.properties.style;
        },
      },
    ],
  });

  return toJsxRuntime(hast, { Fragment, jsx, jsxs });
}
