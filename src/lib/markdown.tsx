import type { ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";
import { CodeBlock } from "@/components/markdown/CodeBlock";
import { PostImage } from "@/components/markdown/PostImage";

/**
 * Rendering for article bodies.
 *
 * Posts used to hold raw HTML injected with `dangerouslySetInnerHTML`, which
 * meant authoring in tags, remembering wrapper divs, and no way to hand a
 * block to a real component. Bodies are markdown now, rendered to React
 * elements through the component map below.
 *
 * This module is server-only by construction: it pulls in Shiki and reads from
 * disk. Rendering happens in the page (a Server Component) and the finished
 * tree is passed down to the client component that owns the language toggle,
 * so neither the markdown parser nor the highlighter reaches the browser.
 */

/** `:::callout` becomes an <aside>, which the component map styles. */
function remarkCallout() {
  return (tree: unknown) => {
    visit(tree as never, (node: Record<string, unknown>) => {
      if (node.type === "containerDirective" && node.name === "callout") {
        node.data = { ...(node.data as object), hName: "aside" };
      }
    });
  };
}

/** Flatten a hast subtree to its text, for handing code to the highlighter. */
function textOf(node: unknown): string {
  const n = node as { type?: string; value?: string; children?: unknown[] };
  if (!n) return "";
  if (n.type === "text") return n.value ?? "";
  return (n.children ?? []).map(textOf).join("");
}

export function renderMarkdown(markdown: string): ReactNode {
  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkDirective, remarkCallout]}
      components={{
        /* A paragraph holding nothing but an image would wrap a <figure> in a
           <p>, which is invalid. Unwrap those; leave every other paragraph. */
        p({ node, children }) {
          const only =
            node?.children?.length === 1 ? node.children[0] : undefined;
          const isImage =
            only && "tagName" in only && only.tagName === "img";
          return isImage ? <>{children}</> : <p>{children}</p>;
        },

        /* Fenced code goes to Shiki. Inline `code` is left alone and picks up
           its styling from the stylesheet. */
        pre({ node }) {
          const code = node?.children?.[0];
          const className =
            code && "properties" in code
              ? String(
                  (code.properties?.className as string[] | undefined)?.[0] ??
                    "",
                )
              : "";
          const lang = /language-(\w+)/.exec(className)?.[1];
          return <CodeBlock code={textOf(code).replace(/\n$/, "")} lang={lang} />;
        },

        /* Wide tables scroll inside their own box rather than widening the
           page. Previously the author had to remember this wrapper. */
        table({ children }) {
          return (
            <div className="table-scroll">
              <table>{children}</table>
            </div>
          );
        },

        img({ src, alt, title }) {
          return (
            <PostImage
              src={typeof src === "string" ? src : undefined}
              alt={alt}
              title={title}
            />
          );
        },
      }}
    >
      {markdown}
    </Markdown>
  );
}
