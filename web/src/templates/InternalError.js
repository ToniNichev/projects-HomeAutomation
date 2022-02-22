import React from 'react';

const publicPath = `${process.env.APP_HOST}:${process.env.ASSETS_SERVER_PORT}/dist/`;

const Html = ({ content, cssBundles, jsBundles, apiData }) => (
  <html lang="en">  
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Internal Error</title>
  </head>
  <body cz-shortcut-listen="true">
    <div id="root">
        INTERNAL ERROR !
    </div>
  </body>
</html>  

);

export default Html;  