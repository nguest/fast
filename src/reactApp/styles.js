/** @jsx jsx */

export const styles = {
  global: {
    'body, html': {
      padding: 0,
      margin: 0,
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
    },
    '*': {
      boxSizing: 'border-box',
    },
    body: {
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;`,
    },
    canvas: {
      display: 'block',
    },
  },
  app: {
    position: 'relative',
  },
  appHeader: {
    backgroundColor: 'grey',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  loadingScreen: {
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    position: 'fixed',
    width: '100vw',
    height: '100vh',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
};
