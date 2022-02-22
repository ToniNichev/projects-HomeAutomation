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


  async updateUser() {
          
    if(document.querySelector('input[type="password"][name="oldPassword"]').value === '') {
      this.setState({popupMessage: 'Please enter the old password!'});
      this.setState({popupVisible: true});        
      return;
    }

    if(document.querySelector('input[type="password"][name="newPassword"]').value === '') {
      this.setState({popupMessage: 'Please enter the new password!'});
      this.setState({popupVisible: true});        
      return;
    }    
        
    const userFromCookie = this.cookies.get('user');
    let postData = {
      email: userFromCookie.email,
      accessToken: userFromCookie.accessToken,
      oldPassword: document.querySelector('input[type="password"][name="oldPassword"]').value,
      newPassword: document.querySelector('input[type="password"][name="newPassword"]').value
    }


    const result = await Poster(`${userApiUrl}/update-user`, postData);
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
        <div className={['signIn']}>
          <h1>Update password</h1>
          <div className={styles.userFieldsContainer}>

              <label>Old Password</label>
              <input type="password" placeholder="Old Password" name="oldPassword" required />                        

              <label>New Password</label>
              <input type="password" placeholder="New Password" name="newPassword" required />            

              <button type="button" onClick={ () => { this.updateUser() }} >UPDATE</button>
          </div>
        </div>
        { this.state.popupVisible && <MessagePopup msg={this.state.popupMessage} closeMessagePopup={ () => this.closeMessagePopup() }/>}
    </div>)
  }
}

export default SignIn;