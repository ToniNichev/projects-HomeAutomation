import React from 'react';
import { BrowserRouter as Router, StaticRouter, Route, Switch } from 'react-router-dom';
import PageLayout from '../../containers/PageLayout';
import styles from './styles.scss';


const client = (props) => {
  return ( 
    <Router>
      <Switch>
        <Route exact path="*" render={(props) => <PageLayout {...props} />} />
      </Switch>
    </Router>
  );
}

const context = {};

if(typeof document != 'undefined') {
  // disable scrolling whern body contains `preventScrolling` class.
  document.addEventListener("touchmove", (e) => {
    if(document.querySelector('body').classList.contains('preventScrolling'))
      e.preventDefault(); 
  }, {passive: false});  
}


const server = (props) => {
  const cookies = props.cookies;
  const apiData = props.apiData;
  return (
    <StaticRouter location={ props.url } serverCookies={cookies} apiData={apiData}  context={context}>
      <Switch>
        <Route exact path="*" render={(props) => <PageLayout serverCookies={cookies} apiData={apiData} {...props} />} />  
      </Switch>            
    </StaticRouter>
  );
}

export default ( { req } ) => { 
  return (
    <div className={styles.appWrapper}>
      {typeof window == 'undefined' ? server(req) :client(req)}
    </div>   
  );
}

