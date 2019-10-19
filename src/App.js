import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { CookiesProvider } from 'react-cookie';
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import './App.css';
import './Login.css';

import Home from './Home';
// import Register from './Register';


const Base = () => (
  <CookiesProvider>
    <Router>
      <div>
        <Route exact path="/" component={Login} />
        <Route path="/home" component={Home} />
        {/* <Route path="/register" component={Register} /> */}
      </div>
    </Router>
  </CookiesProvider>
);

class Login extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isError: false,
      selectedName: "", // Q0
      names: [
        { value: "", display: "(選択してください)" },
        { value: "P1", display: "P1" },
        { value: "P2", display: "P2" },
        { value: "P3", display: "P3" },
        { value: "P4", display: "P4" },
        { value: "P5", display: "P5" },
        { value: "P6", display: "P6" },
        { value: "P7", display: "P7" },
        { value: "P8", display: "P8" },
        { value: "P9", display: "P9" },
        { value: "P10", display: "P10" },
        { value: "P11", display: "P11" },
        { value: "P12", display: "P12" },
        { value: "P13", display: "P13" },
        { value: "P14", display: "P14" },
        { value: "P15", display: "P15" },
        { value: "P16", display: "P16" },
        { value: "P17", display: "P17" },
        { value: "P18", display: "P18" },
        { value: "P19", display: "P19" },
        { value: "P20", display: "P20" }
      ]
    };
  }

  async goToHome() {
    if (this.state.selectedName) {
      const name = this.state.selectedName;
      return (
        this.props.history.push({
          pathname: '/home',
          search: `?id=${name}`
        })
      )
    } else {
      return (
        this.props.history.push('/')
      )
    }
  }

  render() {
    return (
      <div className="container">
        <div>
          <h4 className="font-weight-light mb-4">
            回答者番号
          </h4>
          <div className="cp_group cp_ipselect">
            <select
              className="cp_sl"
              required
              value={this.state.selectedName}
              onChange={e =>
                this.setState({ selectedName: e.target.value })
              }
            >
            {this.state.names.map(tmp => (
              <option key={tmp.value} value={tmp.value}>
                {tmp.display}
              </option>
            ))}
            </select>
            <i className="bar"></i>
          </div>
          <div className="btn_cont">
            <button
              className="btn btn-outline-primary"
              type="button"
              onClick={ () => this.goToHome() }
            ><span>Log in</span></button>
          </div>
        </div>
      </div>
    );
  }
}

export default Base
