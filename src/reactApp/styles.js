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
  statusBar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 10,
    color: 'white',
    backgroundColor: 'black',
  },
  '#reset-button': {
    position: 'absolute',
    bottom: 10,
    left: 10,
    padding: 10,
    /* color: white;
    background-color: black; */
  },
};
