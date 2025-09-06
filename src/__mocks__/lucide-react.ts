import React from 'react';

const lucideReact = new Proxy({}, {
  get: function getter(target, key) {
    if (key === '__esModule') {
      return true;
    }
    if (key === 'default') {
      return lucideReact;
    }
    return (props) => React.createElement('svg', { ...props, 'data-testid': `icon-${String(key)}` });
  },
});

module.exports = lucideReact;
