import React, { Component } from 'react';
import ComponentList from './ComponentList';
import PageData from './PageData';
import Cookies from 'universal-cookie';
const styles = require('./styles.scss');
class PageLayout extends Component {
    constructor(props) {      
      super(props);    
      this.cookies = new Cookies();
      this.user = null;
    } 
  
    render() {      
      let url = this.props.location.pathname;  

      if(typeof window === 'undefined') {
        // server side 
        if(this.props.apiData?.error === 1 ) {
          // url = '/sign-in';
          this.cookies.remove('user');
          return  <div key='{id}' className={styles.error}>Internal server error!</div>
        }
        const userString = this.props.serverCookies.user;
        const user = typeof userString === 'undefined' ? undefined : JSON.parse(userString);
        const hubId = typeof user?.deviceHubs === 'undefined' || user?.deviceHubs.length === 0  ? undefined : user?.deviceHubs[0];
        if(url !== '/sign-in' && typeof user === 'undefined')  {
          url = '/sign-in';
        }

      } else {
        // client side
        const user =  this.cookies.get('user');
        const hubId = typeof user?.deviceHubs === 'undefined' || user?.deviceHubs.length === 0  ? undefined : user?.deviceHubs[0];

        if(url !== '/setup') {
          if(url !== '/sign-in') {
            console.log("###### user :", user);          
            if(typeof user === 'undefined') {              
              url = '/sign-in';
            }
          }
          else if(typeof hubId !== 'undefined') {
            //location.href = `/home?data=["${hubId}"]`;
          }
        }
        window.__API_DATA__.url = url;
      }
      const page = PageData[url];

      const allLayout = page.layout.map((layoutList) => {
        const layout = layoutList.components.map((component, id , components) => {          
          const componentName = component.name;    
          const props = component.props;    
          const ChildComponent = ComponentList[componentName];
          if(typeof ChildComponent === 'undefined') {
            return(
              <div key='{id}' className={styles.error}>Can't find {componentName} component!</div>
            );
          }
          return (
              <ChildComponent key={componentName} props={props} />
          );
        });
        return layout;
      });
      return(
        <div className={styles.app}>
          {allLayout}
        </div>
      );
    }
}
export default PageLayout;
