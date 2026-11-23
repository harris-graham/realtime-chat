import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUserName] = useState('');
  const [userpword, setUserPword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const Auth = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://127.0.0.1:5000/login`, {
        username,
        userpword
      });
      navigate('/chat');
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg);
      }
    }
  }

  return (
    <div className='container-fluid'>
      <div className='col-md-3 mx-auto'>
        <h1 className='text-primary text-center my-5'>CONNEXION</h1>
        <form onSubmit={Auth}>
          <div className='row mb-3'>
            <div className='col-md-4'>
              <label className='col-form-label'>Utilisateur :</label>
            </div>
            <div className='col-md-8'>
              <input type='text' className='form-control' value={username} onChange={(e) => setUserName(e.target.value)} />
            </div>
          </div>
          <div className='row'>
            <div className='col-md-4'>
              <label className='col-form-label'>Mot de passe :</label>
            </div>
            <div className='col-md-8'>
              <input type='password' className='form-control' value={userpword} onChange={(e) => setUserPword(e.target.value)} />
            </div>
          </div>
          <div className='text-center my-5'>
            <button type='submit' className='btn btn-primary'>Se connecter</button>
            <p className='text-danger'>{msg}</p>
          </div>
        </form>
        <div className='text-center'>
          <span>Vous n'&ecirc;tes pas incrit ? </span><a href='register'>Cr&eacute;er un compte</a>
        </div>
      </div>
    </div>
  )
}

export default Login;