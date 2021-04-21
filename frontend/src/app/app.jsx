import React from 'react';
import {LoginPage} from './loginPage';
import {AdminDash} from './adminDash';
import { CreateAccount } from './createAccount';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';


function App() {
  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/register" component={CreateAccount} />
          <Route exact path="/admin-dash" component={AdminDash} />          
        </Switch>
      </Router>
    </>
  );
}

export default App;