import React from 'react';

const Login = ({ onLogin }) => {
  return (
    <div className="login-container">
      <h1>HairCare Admin</h1>
      <p>Sign in to access your dashboard</p>
      <input type="text" placeholder="Username" />
      <input type="password" placeholder="Password" />
      <button onClick={onLogin}>
        <span className="material-icons">lock</span>
        Sign in
      </button>
    </div>
  );
};

export default Login;