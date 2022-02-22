import React, {Component} from 'react';
import styles from './styles.scss';
import Poster from '../../utils/Poster';
import Cookies from 'universal-cookie';
import { userApiUrl} from '../../utils/getParams';
import MessagePopup from '../MessagePopup';


class SignOut extends Component {

  constructor(props) {    
    super(props);
    this.cookies = new Cookies();
    if(typeof window !== 'undefined') {
      this.logOutUser();
    }
    this.state = {
      popupVisible: false,
      popupMessage: '',
      logInPopupVisible: true
    }
  }

  async logOutUser() {
    // runs only on client side
    const user = this.cookies.get('user');
    const postData = {
      accessToken: user.accessToken,
      email: user.email,
    }
    
    const result = await Poster(`${userApiUrl}/log-out`, postData);
    if(typeof result.error === 'undefined') {
      this.cookies = new Cookies();
      this.cookies.remove('user');
      

      this.setState({popupMessage: result.message});
      this.setState({popupVisible: true});
      return;
    }
    
  }

  closeMessagePopup() {
    this.setState({popupVisible: !this.state.popupVisible});
  }

  render() {

    return (
      <div className={styles.wrapper}>
        <div className={['signIn']}>
          <h1>Bye!</h1>
        </div>
        { this.state.popupVisible && <MessagePopup msg={this.state.popupMessage} closeMessagePopup={ () => this.closeMessagePopup() }/>}
    </div>)
  }
}

export default SignOut;