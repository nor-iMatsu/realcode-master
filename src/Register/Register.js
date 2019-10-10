import React, { Component } from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { localStorageKey } from '../Const';
const queryString = require('query-string');


class Register extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);

    // const { cookies } = props;

    this.state = { isError: true };

    this.checkValidUserId = this.checkValidUserId.bind(this);
  }

  componentDidMount() {
    this.checkValidUserId();
  }

  checkValidUserId() {
    console.log("Checking your id...");
    const u_id = queryString.parse(this.props.location.search, { ignoreQueryPrefix: true }).u_id;
    
    // [To-do]: check that the u_id is valid

    // Store the u_id in the local storage
    // localStorage.setItem(localStorageKey, u_id);
    const { cookies } = this.props;
    cookies.set(localStorageKey, u_id, { path: '/' });
    
    // Finally, set isError: false
    this.setState({isError: false});
  }

  render() {
    if (this.state.isError) {
      return (
        <div className="App">
          <p>ERROR</p>
        </div>
      );
    }

    // Got a valid u_id
    return (
      <div className="App">
        <p>Regsiter</p>
      </div>
    );
  }
}

export default withCookies(Register);
