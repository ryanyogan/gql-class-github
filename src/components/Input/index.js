import React from 'react';

import './style.css';

const Input = ({ color = 'black', ...props }) => (
  <input className={`Input Input_${color}`} {...props} />
);

export default Input;
