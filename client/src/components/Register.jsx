import axios from 'axios';
import React, { useState } from 'react';

const initialState = {
  UserFName: '',
  UserLName: '',
  UserName: '',
  userPword: '',
  userCPword: ''
};

const Register = () => {
  const [msg, setMsg] = useState('');
  const [UserImg, setUserImg] = useState('');

  const [state, setState] = useState(initialState);
  const { UserFName, UserLName, UserName, userPword, userCPword } = state;

  const inputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const Register = async (e) => {
    e.preventDefault();
    if (userPword !== userCPword) {
      setMsg('Mot de passe et confirmation différents!');
    } else {
      try {
        axios.post(`http://127.0.0.1:5000/userIns`, {
          UserFName, UserLName, UserImg, UserName, userPword
        });
        window.location.reload();
        // setState(initialState);
        // setMsg('Inscription réussie!');
      } catch (err) {
        console.log(err.res.data);
      };
    }
  };

  const fileread = async (e) => {
    const file = e.target.files[0];
    const base64 = await conb64(file);
    setUserImg(base64);
  };

  const conb64 = (file) => {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        res(reader.result);
      }
      reader.onerror = (err) => {
        rej(err);
      }
    });
  };

  return (
    <div className='container-fluid'>
      <div className='col-md-3 mx-auto'>
        <h1 className='text-primary text-center my-5'>INSCRIPTION</h1>
        <form onSubmit={Register}>
          <div className='row mb-3'>
            <div className='col-md-4'>
              <label className='col-form-label'>Nom :</label>
            </div>
            <div className='col-md-8'>
              <input className='form-control' name='UserFName' value={UserFName} onChange={inputChange} />
            </div>
          </div>
          <div className='row mb-3'>
            <div className='col-md-4'>
              <label className='col-form-label'>Prenom :</label>
            </div>
            <div className='col-md-8'>
              <input className='form-control' name='UserLName' value={UserLName} onChange={inputChange} />
            </div>
          </div>
          <div className='row mb-3'>
            <div className='col-md-4'>
              <label className='col-form-label'>Image :</label>
            </div>
            <div className='col-md-8'>
              <input type='file' className='form-control' onChange={(e) => fileread(e)} accept='.jpeg, .png, .jpg' />
            </div>
          </div>
          <div className='row mb-3'>
            <div className='col-md-4'>
              <label className='col-form-label'>Utilisateur :</label>
            </div>
            <div className='col-md-8'>
              <input className='form-control' name='UserName' value={UserName} onChange={inputChange} />
            </div>
          </div>
          <div className='row mb-3'>
            <div className='col-md-4'>
              <label className='col-form-label'>Mot de passe :</label>
            </div>
            <div className='col-md-8'>
              <input type='password' className='form-control' name='userPword' value={userPword} onChange={inputChange} />
            </div>
          </div>
          <div className='row'>
            <div className='col-md-4'>
              <label className='col-form-label'>Confirmation :</label>
            </div>
            <div className='col-md-8'>
              <input type='password' className='form-control' name='userCPword' value={userCPword} onChange={inputChange} />
            </div>
          </div>
          <div className='text-center my-5'>
            <button type='submit' className='btn btn-primary'>Enregistrer</button>
            <p className='text-danger'>{msg}</p>
          </div>
        </form>
        <div className='text-center'>
          <span>Vous avez d&eacute;j&agrave; un compte ? </span><a href='/'>Se connecter</a>
        </div>
      </div>
    </div>
  );
}

export default Register;