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
  info: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    zIndex: 10,
    width: 200,
    backgroundColor: 'black',
  },
  info2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 10,
    width: 200,
    backgroundColor: 'black',
  },
  statusBar: {
    padding: 10,
    color: 'white',
    right: 0,
  },
  gamePosition: {
    left: 100,
    width: 100,
    padding: 10,
    color: 'white',
  },
  resetButton: {
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
