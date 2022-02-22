import React, {Component} from 'react';
import styles from './styles.scss';
import Poster from '../../utils/Poster';
import Cookies from 'universal-cookie';
import { userApiUrl} from '../../utils/getParams';
import MessagePopup from '../MessagePopup';


class SignIn extends Component {

  constructor(props) {    
    super(props);
    if(typeof window !== 'undefined') {
      window.redirect = (hubId) => {
        location.href=`/home?data=["${hubId}"]`;
      }
    }
    this.cookies = new Cookies();
    this.state = {
      popupVisible: false,
      popupMessage: '',
      logInPopupVisible: true
    }
  }

  closeMessagePopup() {
    this.setState({popupVisible: !this.state.popupVisible});
  }

  showLogInPopup() {
    this.setState({logInPopupVisible: true});
  }

  showSignInPopup() {
    this.setState({logInPopupVisible: false});
  }


  async logIn() {
    if(document.querySelector('input[type="password"][name="password"]').value === '') {
      this.setState({popupMessage: 'Please enter password!'});
      this.setState({popupVisible: true});        
      return;
    }
    if(document.querySelector('input[type="text"][name="email"]').value === '') {
      this.setState({popupMessage: 'Please enter valid e-mail!'});
      this.setState({popupVisible: true});        
      return;
    }

    const postData = {
      email: document.querySelector('input[type="text"][name="email"]').value,
      password: document.querySelector('input[type="password"][name="password"]').value,
    }    
    
    const result = await Poster(`${userApiUrl}/log-in`, postData);
    if(typeof result.error !== 'undefined') {
      this.setState({popupMessage: result.message});
      this.setState({popupVisible: true});
      return;
    }
    const user = JSON.stringify(result);
    const hubId = result.thermostatHubs[0];
    this.cookies.set('user', user, { path: '/' });
    //const l = 
    this.setState({popupMessage: `<p>Welcome!</p><p><button onclick="window.redirect('${hubId}')">OK</button></p>`});
    this.setState({popupVisible: true});
    this.forceUpdate();
  }


  async registerUser() {
    if(document.querySelector('input[type="password"][name="password"]').value === '') {
      this.setState({popupMessage: 'Please enter password!'});
      this.setState({popupVisible: true});        
      return;
    }
    if(document.querySelector('input[type="text"][name="email"]').value === '') {
      this.setState({popupMessage: 'Please enter valid e-mail!'});
      this.setState({popupVisible: true});        
      return;
    }
    if(document.querySelector('input[type="text"][name="hubId"]').value === '') {
      this.setState({popupMessage: 'Please enter valid hub id!'});
      this.setState({popupVisible: true});        
      return;
    }            
    const postData = {
      email: document.querySelector('input[type="text"][name="email"]').value,
      password: document.querySelector('input[type="password"][name="password"]').value,
      hubId: document.querySelector('input[type="text"][name="hubId"]').value
    }
    const result = await Poster(`${userApiUrl}/register-user`, postData);
    let popupMsg = result.message;
    if(typeof result.errorCode === 'undefined') {
      popupMsg += '<p><button onclick="location.reload()">SIGN IN</button></p>';
    }
    this.setState({popupMessage: popupMsg});
    this.setState({popupVisible: true});
  }

  render() {

    return (
      <div className={styles.wrapper}>
        {!this.state.logInPopupVisible && 
        <div className={['signIn']}>
          <h1>Sign In</h1>
          <div className={styles.userFieldsContainer}>
              <label>User e-mail</label>
              <input type="text" placeholder="Enter Username" name="email" required />

              <label>Password</label>
              <input type="password" placeholder="Enter Password" name="password" required />            

              <label>Hub ID</label>
              <input type="text" placeholder="Enter hub ID" name="hubId" required />            

              <button type="button" onClick={ () => { this.registerUser() }} >REGISTER</button>
              <p><a href="#" onClick={() =>{ this.showLogInPopup() }}>Log In</a></p>
          </div>
        </div>}

        {this.state.logInPopupVisible && 
        <div className={['LogIn']}>
          <h1>Log In</h1>
            <div className={styles.userFieldsContainer}>
              <label>User e-mail</label>
                <input type="text" placeholder="Enter Username" name="email" required />

                <label>Password</label>
                <input type="password" placeholder="Enter Password" name="password" required /> 

                <button type="button" onClick={ () => { this.logIn() }} >LOG IN</button>    
                <p><a href="#" onClick={() =>{ this.showSignInPopup() }}>Sign In</a></p>                               
            </div>
        </div>}
        { this.state.popupVisible && <MessagePopup msg={this.state.popupMessage} closeMessagePopup={ () => this.closeMessagePopup() }/>}
    </div>)
  }
}

export default SignIn;