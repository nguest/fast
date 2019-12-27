/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import { styles } from './styles';

export const Loader = () => (
  <div css={styles.loader}>
    <span />
    <span />
    <span />
  </div>
);
