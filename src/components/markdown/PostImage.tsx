import path from "node:path";
import { readFile } from "node:fs/promises";
import Image from "next/image";
import { imageSize } from "image-size";

/**
 * Intrinsic size of an image in `public/`.
 *
 * next/image needs explicit dimensions for a plain path, and markdown has
 * nowhere to write them. Reading them off disk keeps authoring to a normal
 * `![alt](/blog/x.png)` while still getting an optimised, non-reflowing image.
 */
async function intrinsicSize(src: string) {
  if (!src.startsWith("/")) return null;
  try {
    const file = await readFile(path.join(process.cwd(), "public", src));
    const { width, height } = imageSize(file);
    return width && height ? { width, height } : null;
  } catch {
    // Remote URL, missing file, or a format image-size can't read.
    return null;
  }
}

/**
 * An image in article prose.
 *
 * Markdown's title slot becomes the caption: `![alt](/blog/x.png "Caption")`.
 * A `#wide` fragment on the path opts the image out of the reading column on
 * large screens.
 */
export async function PostImage({
  src,
  alt,
  title,
}: {
  src?: string;
  alt?: string;
  title?: string;
}) {
  if (!src) return null;

  const wide = src.includes("#wide");
  const cleanSrc = src.replace("#wide", "");
  const size = await intrinsicSize(cleanSrc);
  const className = wide ? "wide" : undefined;

  const image = size ? (
    <Image
      src={cleanSrc}
      alt={alt ?? ""}
      width={size.width}
      height={size.height}
      className={className}
      sizes="(max-width: 860px) 100vw, 780px"
    />
  ) : (
    // No dimensions available: fall back to a plain tag. The stylesheet still
    // constrains it, so this degrades in quality, never in layout.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={cleanSrc} alt={alt ?? ""} className={className} />
  );

  if (!title) return image;

  return (
    <figure className={className}>
      {image}
      <figcaption>{title}</figcaption>
    </figure>
  );
}
