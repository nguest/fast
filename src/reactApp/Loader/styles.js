import { jsx, css, keyframes } from '@emotion/core';

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
      '&:nth-child(1)': {
        animation: css`${bounce} 1s ease-in-out infinite`,
      },
      '&:nth-child(2)': {
        animation: css`${bounce} 1s ease-in-out 0.33s infinite`,
      },
      '&:nth-child(3)': {
        animation: css`${bounce} 1s ease-in-out 0.66s infinite`,
      },
    },
  },
};
