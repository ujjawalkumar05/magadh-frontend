import { useState } from "react";
import "./FadeImage.css";

/*
 * FadeImage
 *
 * Problem it fixes:
 * A plain <img> shows nothing until the file is fully downloaded
 * and decoded, then pops in instantly. On slower connections or
 * larger PNGs this reads as a "blink"/flash.
 *
 * Fix:
 * Keep the image at opacity 0 until its onLoad fires, then
 * transition it in smoothly. A soft placeholder box fills the
 * space until then, so there's no layout jump either.
 *
 * Usage is a drop-in replacement for <img>:
 *   <FadeImage src={url} alt="..." className="product-img" />
 */
function FadeImage({ src, alt = "", className = "", style, ...rest }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={`fade-image-wrap ${className}`} style={style}>
      {!loaded && <span className="fade-image-placeholder" aria-hidden="true" />}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`fade-image ${loaded ? "fade-image-loaded" : ""}`}
        {...rest}
      />
    </span>
  );
}

export default FadeImage;
