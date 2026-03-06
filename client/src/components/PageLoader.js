import React from 'react';

const PageLoader = ({ text = 'Loading…' }) => (
  <div className="page-loader" role="status" aria-label={text}>
    <div className="page-loader__ring" />
    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.82rem', color: 'var(--slate)' }}>
      {text}
    </span>
  </div>
);

export default PageLoader;
