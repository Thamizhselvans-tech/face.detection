import React, { useState, useEffect, useRef } from 'react';
import { fetchSecureImage } from '../services/api';

/**
 * SecureImage
 * ────────────
 * Fetches a private image through the Axios instance (which attaches the JWT).
 * Converts the blob to an object URL so the img src never exposes the raw
 * backend URL with a naked token in the query string.
 *
 * If your backend serves images as public CDN / pre-signed URLs already
 * scoped to the student, pass `publicSrc` instead and this component
 * will just render normally.
 *
 * Props:
 *   src         — backend path requiring auth, e.g. '/api/student/me/photo'
 *   publicSrc   — already-public URL (skips secure fetch)
 *   alt, className, style, ...rest
 */
const SecureImage = ({
  src,
  publicSrc,
  alt = 'Student photo',
  className = '',
  style = {},
  fallback = null,
  ...rest
}) => {
  const [objectUrl, setObjectUrl] = useState(null);
  const [errored,   setErrored]   = useState(false);
  const prevUrl = useRef(null);

  useEffect(() => {
    // Use public URL directly
    if (publicSrc) {
      setObjectUrl(publicSrc);
      return;
    }

    if (!src) return;

    let cancelled = false;

    fetchSecureImage(src)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        // Revoke previous object URL to avoid memory leaks
        if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
        prevUrl.current = url;
        setObjectUrl(url);
        setErrored(false);
      })
      .catch(() => {
        if (!cancelled) setErrored(true);
      });

    return () => {
      cancelled = true;
    };
  }, [src, publicSrc]);

  // Revoke on unmount
  useEffect(() => {
    return () => {
      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
    };
  }, []);

  if (errored) return fallback;
  if (!objectUrl) return null;

  return (
    <img
      src={objectUrl}
      alt={alt}
      className={`profile-img ${className}`}
      style={{ WebkitUserDrag: 'none', ...style }}
      draggable="false"
      {...rest}
    />
  );
};

export default SecureImage;
