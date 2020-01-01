import { css, keyframes } from '@emotion/core';

const bounce = keyframes`
  0%, 75%, 100%{
    -webkit-transform: translateY(0);
    -ms-transform: translateY(0);
    -o-transform: translateY(0);
    transform: translateY(0);
  }

  25%{
    -webkit-transform: translateY(-20px);
    -ms-transform: translateY(-20px);
    -o-transform: translateY(-20px);
    transform: translateY(-20px);
  }
}`;

export const styles = {
  loader: {
    span: {
      display: 'inline-block',
      width: 20,
      height: 20,
      borderRadius: '100%',
      backgroundColor: 'white',
      margin: '35px 5px',
      '&:nth-of-type(1)': {
        animation: css`${bounce} 1s ease-in-out infinite`,
      },
      '&:nth-of-type(2)': {
        animation: css`${bounce} 1s ease-in-out 0.33s infinite`,
      },
      '&:nth-of-type(3)': {
        animation: css`${bounce} 1s ease-in-out 0.66s infinite`,
      },
    },
  },
};
