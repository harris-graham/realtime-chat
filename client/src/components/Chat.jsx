import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import moment from 'moment';
import 'moment/locale/fr';
moment.locale('fr');

const initialState = {
  UserFName: '',
  UserLName: '',
  UserName: '',
  userPword: ''
};

const Chat = () => {
  const [token, setToken] = useState('');
  const [expire, setExpire] = useState('');
  const [curUID, setCurUID] = useState('');
  const [curUFN, setCurUFN] = useState('');
  const [curULN, setCurULN] = useState('');
  const [curUImg, setCurUImg] = useState('');
  const [curUN, setCurUN] = useState('');
  const [curPresence, setCurPresence] = useState({});
  const [chatPresence, setChatPresence] = useState({});
  const [newMess, setNewMess] = useState('');
  const [UserImg, setUserImg] = useState('');
  const [chat, setChat] = useState([]);
  const [curChat, setCurChat] = useState([]);
  const [curMess, setCurMess] = useState([]);
  const [onlUser, setOnlUser] = useState([]);
  const [sendMess, setSendMess] = useState([]);
  const [recMess, setRecMess] = useState([]);
  const [userNC, setUserNC] = useState([]);
  const [sendInvit, setSendInvit] = useState([]);
  const [recInvit, setRecInvit] = useState([]);
  const [invitS, setInvitS] = useState([]);
  const [invitR, setInvitR] = useState([]);
  const [sendAccI, setSendAccI] = useState([]);
  const [recAccI, setRecAccI] = useState([]);
  const [sendDecI, setSendDecI] = useState([]);
  const [recDecI, setRecDecI] = useState([]);
  const [sendDelI, setSendDelI] = useState([]);
  const [recDelI, setRecDelI] = useState([]);
  const [pinned, setPinned] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [typing, setTyping] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const navigate = useNavigate();
  const socket = useRef();
  const scroll = useRef();
  const typingTimeout = useRef();

  useEffect(() => {
    refreshToken();
    userSelCByUID();
    messSelByUID();
    socket.current = io(`http://127.0.0.1:8000`);
    if (curUID) socket.current.emit('add-new-user', curUID);
    socket.current.on('get-user', (user) => {
      setOnlUser(user);
    });
    if (sendMess !== null) {
      socket.current.emit('send-mess', sendMess);
      setSendMess(null);
    }
    socket.current.on('rec-mess', (data) => {
      setRecMess(data);
    });
    if (recMess !== null && recMess.UserRecip === curUID && recMess.UserSend === curChat.UserID) {
      setCurMess([...curMess, recMess]);
      setRecMess(null);
    }
    scroll.current?.scrollIntoView({ behavior: 'smooth' });
    userSelNCByUID();
    if (sendInvit !== null) {
      socket.current.emit('send-invit', sendInvit);
      setSendInvit(null);
    }
    socket.current.on('rec-invit', (data) => {
      setRecInvit(data);
    });
    if (recInvit !== null && recInvit.UserRecip === curUID) {
      setInvitS([...invitS, recInvit]);
      setRecInvit(null);
    }
    invitSelBySID();
    invitSelByRID();
    if (sendAccI !== null) {
      socket.current.emit('send-acc-invit', sendAccI);
      setSendAccI(null);
    }
    socket.current.on('rec-acc-invit', (data) => {
      setRecAccI(data);
    });
    if (recAccI !== null && recAccI.UserSend === curUID) {
      setChat([...chat, recAccI]);
      setRecAccI(null);
    }
    if (sendDecI !== null) {
      socket.current.emit('send-dec-invit', sendDecI);
      setSendDecI(null);
    }
    socket.current.on('rec-dec-invit', (data) => {
      setRecDecI(data);
    });
    if (recDecI !== null && recDecI.UserSend === curUID) {
      setInvitR(invitR.filter((invitR) => invitR !== recDecI));
      setRecDecI(null);
    }
    if (sendDelI !== null) {
      socket.current.emit('send-del-invit', sendDelI);
      setSendDelI(null);
    }
    socket.current.on('rec-del-invit', (data) => {
      setRecDelI(data);
    });
    if (recDelI !== null && recDelI.UserRecip === curUID) {
      setInvitS(invitS.filter((invitS) => invitS !== recDelI));
      setRecDelI(null);
    }
    socket.current.on('get-typing', (data) => {
      if (data.chatWith === curUID) setTyping(data);
    });
    socket.current.on('get-typing-stop', (data) => {
      if (data.chatWith === curUID && data.userId === typing?.userId) setTyping(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curUID, curChat, sendMess, recMess, sendInvit, recInvit, sendAccI, recAccI, sendDecI, recDecI, sendDelI, recDelI, typing]);

  const refreshToken = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/token`);
      setToken(response.data.accessToken);
      const decoded = jwt_decode(response.data.accessToken);
      setCurUID(decoded.userid);
      setCurUFN(decoded.userfname);
      setCurULN(decoded.userlname);
      setCurUImg(decoded.userimg);
      setCurUN(decoded.username);
      setExpire(decoded.exp);
      fetchPresence(curUID).then((d) => d && setCurPresence(d));
      fetchPinned();
      fetchBlocked(curUID);

      axiosJWT.interceptors.request.use(async (config) => {
        const currentDate = new Date();
        if (expire * 1000 < currentDate.getTime()) {
          const response = await axios.get(`http://127.0.0.1:5000/token`);
          config.headers.Authorization = `Bearer ${response.data.accessToken}`;
          setToken(response.data.accessToken);
          const decoded = jwt_decode(response.data.accessToken);
          setExpire(decoded.exp);
        }
        return config;
      }, (error) => {
        return Promise.reject(error);
      });
    } catch (error) {
      if (error.response) {
        navigate('/');
      }
    }
  }

  const fetchPresence = async (userId) => {
    if (!userId) return null;
    try {
      const response = await axiosJWT.get(`http://127.0.0.1:5000/user/presence/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const setPresence = async (is_online, dnd) => {
    try {
      await axiosJWT.put(`http://127.0.0.1:5000/user/presence`, {
        userId: curUID, is_online, dnd
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurPresence({ ...curPresence, is_online, dnd, last_seen: new Date().toISOString() });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPinned = async () => {
    try {
      const response = await axiosJWT.get(`http://127.0.0.1:5000/message/pins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPinned(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchBlocked = async (userId) => {
    if (!userId) return;
    try {
      const response = await axiosJWT.get(`http://127.0.0.1:5000/user/blocked?blockerId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlocked(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const togglePin = async (messageId, pinnedBy) => {
    const isPinned = pinned.some((p) => p.messageId === messageId);
    try {
      if (isPinned) {
        await axios.delete(`http://127.0.0.1:5000/message/pin/${messageId}`);
      } else {
        await axios.post(`http://127.0.0.1:5000/message/pin/${messageId}`, { userId: pinnedBy });
      }
      fetchPinned();
    } catch (error) {
      console.log(error);
    }
  };

  const toggleBlock = async (blockedId) => {
    const isBlocked = blocked.some((b) => b.UserID === blockedId);
    try {
      if (isBlocked) {
        await axios.delete(`http://127.0.0.1:5000/user/block/${blockedId}`, { data: { userId: curUID } });
      } else {
        await axios.post(`http://127.0.0.1:5000/user/block/${blockedId}`, { userId: curUID });
      }
      fetchBlocked(curUID);
    } catch (error) {
      console.log(error);
    }
  };

  const axiosJWT = axios.create();

  const userSelCByUID = async () => {
    if (curUID) {
      const response = await axiosJWT.get(`http://127.0.0.1:5000/userSelCByUID/${curUID}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setChat(response.data);
    }
  }

  const [state, setState] = useState(initialState);
  const { UserFName, UserLName, UserName, userPword } = state;

  const inputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const userUpd = async (e, curuid) => {
    e.preventDefault();
    try {
      axios.put(`http://127.0.0.1:5000/userUpd/${curuid}`, {
        UserFName, UserLName, UserImg, UserName, userPword
      });
    } catch (error) { console.log(error.res.data) };
    window.location.reload();
  };

  const messSelByUID = async () => {
    if (curChat?.UserID) {
      const response = await axiosJWT.get(`http://127.0.0.1:5000/messSelByUID/${curUID}/${curChat?.UserID}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCurMess(response.data);
      fetchPresence(curChat.UserID).then((d) => setChatPresence(d));
    }
  }

  const messIns = async (e, recipID) => {
    e.preventDefault();
    const mess = {
      MessText: newMess,
      UserSend: curUID,
      UserRecip: recipID,
      ...(replyTo ? { replyToId: replyTo.MessID } : {})
    }
    try {
      const { data } = await axios.post(`http://127.0.0.1:5000/messIns`, mess);
      setCurMess([...curMess, data]);
      setNewMess('');
      setReplyTo(null);
      setSendMess(data);
    } catch (error) {
      console.log(error.res.data);
    }
  }

  const userSelNCByUID = async () => {
    if (curUID) {
      const response = await axiosJWT.get(`http://127.0.0.1:5000/userSelNCByUID/${curUID}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUserNC(response.data);
    }
  }

  const invitIns = async (e, userNCID) => {
    e.preventDefault();
    const invit = {
      UserSend: curUID,
      UserRecip: userNCID
    }
    try {
      const { data } = await axios.post(`http://127.0.0.1:5000/invitIns`, invit);
      setInvitR([...invitR, data]);
      setSendInvit(data);
    } catch (error) {
      console.log(error.res.data);
    }
  }

  const invitSelBySID = async () => {
    if (curUID) {
      const response = await axiosJWT.get(`http://127.0.0.1:5000/invitSelBySID/${curUID}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setInvitR(response.data);
    }
  }

  const invitSelByRID = async () => {
    if (curUID) {
      const response = await axiosJWT.get(`http://127.0.0.1:5000/invitSelByRID/${curUID}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setInvitS(response.data);
    }
  }

  const invitDelByS = async (e, invitSD) => {
    e.preventDefault();
    try {
      axios.delete(`http://127.0.0.1:5000/invitDel/${invitSD.UserSend}/${curUID}`);
      setInvitS(invitS.filter((invitS) => invitS !== invitSD));
      setSendDecI(invitSD);
    } catch (error) {
      console.log(error.res.data);
    }
  }

  const invitDelByR = async (e, invitRD) => {
    e.preventDefault();
    try {
      axios.delete(`http://127.0.0.1:5000/invitDel/${curUID}/${invitRD.UserRecip}`);
      setInvitR(invitR.filter((invitR) => invitR !== invitRD));
      setSendDelI(invitRD);
    } catch (error) {
      console.log(error.res.data);
    }
  }

  const chatIns = async (e, invitSD) => {
    e.preventDefault();
    const chatU = {
      UserSend: invitSD.UserSend,
      UserRecip: curUID
    }
    const UserSend = invitSD.UserSend;
    try {
      await axios.post(`http://127.0.0.1:5000/chatIns`, chatU);
      setInvitS(invitS.filter((invitS) => invitS !== invitSD));
      setChat([...chat, invitSD]);
      setSendAccI({ curUID, curUImg, curUFN, curULN, UserSend });
    } catch (error) {
      console.log(error.res.data);
    }
  }

  const checkOnSta = (userID) => {
    const online = onlUser.find((user) => user.UserID === userID);
    return online ? true : false;
  }

  const imageRead = async (e, recipID) => {
    const file = e.target.files[0];
    const base64 = await conB64(file);
    const mess = {
      MessImg: base64,
      UserSend: curUID,
      UserRecip: recipID
    }
    try {
      const { data } = await axios.post(`http://127.0.0.1:5000/messIns`, mess);
      setCurMess([...curMess, data]);
      setNewMess('');
      setSendMess(data);
    } catch (error) {
      console.log(error.res.data);
    }
  }

  const fileRead = async (e) => {
    const file = e.target.files[0];
    const base64 = await conB64(file);
    setUserImg(base64);
  }

  const conB64 = (file) => {
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
  }

  const formatMentions = (text) => {
    const parts = text.split(/(@\w+)/);
    return parts.map((part, i) => part.startsWith('@') ? (
      <span key={i} className='text-info fw-bold'>{part}</span>
    ) : part);
  };

  const Logout = async () => {
    try {
      await axios.delete('http://127.0.0.1:5000/logout');
      navigate('/');
    } catch (error) {
      console.log(error);
    }
    window.location.reload();
  }

  return (
    <div className='container-fluid'>
      <div className='row'>
        <div className='card col-md-3 text-center' style={{ height: 800 }}>
          <h1 className='text-warning pt-3'>SHUT UP</h1><hr />
          <h4 className='text-primary'>Conversation</h4>
          <div className='card' style={{ height: 644, overflowX: 'hidden' }}>
            {chat.length !== 0 ? chat.map((chat, index) => (
              <div key={index + 1}>
                <div className={curChat.UserID === chat.UserID ? 'btn d-grid active' : 'btn d-grid'} onClick={() => setCurChat(chat)}>
                  <div className='row'>
                    <div className='col-md-2'><img src={chat?.UserImg ? chat?.UserImg : 'favicon.ico'} alt='' width={37.5} height={37.5} style={{ borderRadius: 37.5 }} /></div>
                    <div className='col-md-10' style={{ width: 'auto' }}>
                      <h6 className='m-0'>{chat?.UserFName} {chat?.UserLName}</h6>
                      <div style={{ fontSize: '62%' }}>{checkOnSta(chat?.UserID) ? 'En ligne' : 'Hors ligne'}</div>
                    </div>
                  </div>
                </div><hr className='m-0' />
              </div>
            )) : (
              <span className='m-3'>
                Envoyez des demandes pour commencer une conversation...
              </span>
            )}
          </div>
        </div>
        <div className='col-md-6 card' style={{ height: 800 }}>
          {curChat.UserID ? (
            <><div className='row my-3'>
              <div className='col-md-1'><img src={curChat?.UserImg ? curChat?.UserImg : 'favicon.ico'} alt='' width={50} height={50} style={{ borderRadius: 50 }} /></div>
              <div className='col-md-11'>
                <h5 className='m-0'>{curChat?.UserFName} {curChat?.UserLName}</h5>
                <div>
                  {chatPresence.dnd && <span className='badge bg-danger'>Do not disturb</span>}
                  {checkOnSta(curChat?.UserID) ? 'En ligne' : 'Hors ligne'}
                  {chatPresence.last_seen ? ` • vu il y a ${moment(chatPresence.last_seen).fromNow()}` : ''}
                </div>
                {typing && typing.userId === curChat.UserID && (
                  <div className='text-warning small'>{typing.userName} is typing...</div>
                )}
              </div>
            </div>
              <div className='card mb-3' style={{ height: 625, overflowX: 'hidden' }}>
                {curMess.length !== 0 ? curMess.map((curMess, index) => {
                  const replied = curMess.replyToId ? curMess.find((m) => m.MessID === curMess.replyToId) : null;
                  const isPinned = pinned.some((p) => p.messageId === curMess.MessID);
                  return (
                    <div key={index + 1} className='text-light m-2' ref={scroll}>
                      <div className='row'>
                        <div hidden={curMess?.UserSend === curUID} className='col-md-1'><img src={curChat?.UserImg ? curChat?.UserImg : 'favicon.ico'} alt='' width={37.5} height={37.5} style={{ borderRadius: 37.5 }} /></div>
                        <div className={curMess?.UserSend === curUID ? 'col-md-11' : 'col-md-10'}>
                          {replied && (
                            <div className='small fst-italic mb-1 border-start border-primary ps-2' style={{ opacity: 0.8 }}>
                              Reply to {replied.UserSend === curUID ? 'you' : replied.UserFName}: {replied.MessText}
                            </div>
                          )}
                          {curMess?.MessText ? (
                            <div className={curMess?.UserSend === curUID ? 'bg-primary ms-auto me-2 p-2' : 'bg-warning p-2'} style={curMess?.UserSend === curUID ? { width: 'auto', maxWidth: '75%', borderTopLeftRadius: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 } : { width: 'auto', maxWidth: '75%', borderTopRightRadius: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
                              <div>{formatMentions(curMess?.MessText)}</div>
                              {isPinned && <span className='badge bg-warning text-dark ms-2'>Pinned</span>}
                              <div style={{ fontSize: '62%' }}>{moment(curMess?.createdAt).fromNow()}</div>
                              {curMess.UserSend === curUID && (
                                <button className='btn btn-sm btn-outline-light mt-1' onClick={() => togglePin(curMess.MessID, curUID)}>
                                  {isPinned ? 'Unpin' : 'Pin'}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className={curMess?.UserSend === curUID ? 'bg-primary ms-auto me-2 p-0' : 'bg-warning p-0'} style={{ width: 'auto', maxWidth: '75%', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
                              <img src={curMess?.MessImg ? curMess?.MessImg : 'favicon.ico'} alt='' />
                              <div className='mx-2 m-1' style={{ fontSize: '62%' }}>{moment(curMess?.createdAt).fromNow()}</div>
                            </div>
                          )}
                        </div>
                        {curMess.UserSend === curUID && <div className='col-md-1'><button className='btn btn-sm btn-outline-light' onClick={() => setReplyTo(curMess)}>Reply</button></div>}
                      </div>
                    </div>
                  );
                }) : (
                  <span className='text-center m-3'>
                    Commencez une conversation avec {curChat?.UserFName} {curChat?.UserLName}
                  </span>
                )}
              </div>
              <div className='row'>
                {replyTo && (
                  <div className='col-md-12 alert alert-info small'>
                    Replying to: {replyTo.MessText}{' '}
                    <button className='btn btn-sm btn-outline-secondary ms-2' onClick={() => setReplyTo(null)}>Cancel</button>
                  </div>
                )}
                <div className='col-md-1'>
                  <input type='file' className='form-control' onChange={(e) => imageRead(e, curChat?.UserID)} accept='.jpeg, .png, .jpg' />
                </div>
                <div className='col-md-10'>
                  <textarea className='form-control' style={{ resize: 'none' }} value={newMess} onChange={(e) => {
                    setNewMess(e.target.value);
                    if (curChat?.UserID && socket.current) {
                      socket.current.emit('typing-start', { userId: curUID, userName: curUN, chatWith: curChat.UserID });
                      if (typingTimeout.current) clearTimeout(typingTimeout.current);
                      typingTimeout.current = setTimeout(() => {
                        socket.current.emit('typing-stop', { userId: curUID, chatWith: curChat.UserID });
                      }, 1000);
                    }
                  }} />
                </div>
                <div className='col-md-1'>
                  <button className='btn btn-primary' onClick={(e) => newMess !== '' ? messIns(e, curChat?.UserID) : null}>&#9658;</button>
                </div>
              </div></>
          ) : (
            <h3 className='text-center m-5'>
              Taper sur une conversation pour commencer...
            </h3>
          )}
        </div>
        <div className='card col-md-3 text-center' style={{ height: 800 }}>
          <div className='mt-3'>
            <h4 className='text-primary'>Utilisateur actuel</h4>
            <div className='btn d-grid'>
              <div className='row'>
                <div className='col-md-3'><img src={curUImg ? curUImg : 'favicon.ico'} alt='' width={50} height={50} style={{ borderRadius: 50 }} /></div>
                <div className='col-md-9' style={{ width: 'auto' }}>
                  <h5 className='mb-0'>{curUFN} {curULN}</h5>
                  <div>{checkOnSta(curUID) ? 'En ligne' : 'Hors ligne'}</div>
                </div>
              </div>
            </div><hr className='m-0' />
            <div className='btn d-grid' data-bs-toggle='modal' data-bs-target='#invitR'>{invitR.length === 0 ? 'Demandes' : invitR.length === 1 ? '(' + invitR.length + ') Demande' : '(' + invitR.length + ') Demandes'}</div><hr className='m-0' />
            <div className='btn d-grid' data-bs-toggle='modal' data-bs-target='#invitS'>{invitS.length === 0 ? 'Invitations' : invitS.length === 1 ? '(' + invitS.length + ') Invitation' : '(' + invitS.length + ') Invitations'}</div><hr className='m-0' />
            <div className='btn d-grid' data-bs-toggle='modal' data-bs-target='#userUpd' onClick={() => setState({ UserFName: curUFN, UserLName: curULN, UserName: curUN, userPword: '' })}>Compte</div><hr className='m-0' />
            <div className='btn d-grid' onClick={() => setPresence(curPresence.is_online, !curPresence.dnd)}>
              {curPresence.dnd ? 'Recevoir les notifications' : 'Ne pas déranger'}
            </div><hr className='m-0' />
            <div className='btn d-grid' data-bs-toggle='modal' data-bs-target='#logout'>Deconnexion</div><hr className='m-0' />
          </div>
          <h4 className='text-primary mt-3'>Autres utilisateurs</h4>
          <div className='card' style={{ height: 460, overflowX: 'hidden' }}>
            {userNC.filter((u) => !blocked.some((b) => b.UserID === u.UserID)).map((userNC, index) => (
              <div key={index + 1}>
                <div className="btn d-grid">
                  <div className='row'>
                    <div className='col-md-2'><img src={userNC?.UserImg ? userNC?.UserImg : 'favicon.ico'} alt='' width={37.5} height={37.5} style={{ borderRadius: 37.5 }} /></div>
                    <div className='col-md-7 my-auto' style={{ width: 'auto' }}>
                      <h6 className='mb-0'>{userNC?.UserFName} {userNC?.UserLName}</h6>
                      <div style={{ fontSize: '62%' }}>{userNC?.comChat === 0 ? 'Aucun ami' : userNC?.comChat === 1 ? userNC?.comChat + ' ami' : userNC?.comChat + ' amis'} en commun</div>
                    </div>
                    <div className='col-md-3 my-auto ms-auto'>
                      {blocked.some((b) => b.UserID === userNC.UserID) ? (
                        <button className='btn btn-sm btn-outline-danger' onClick={() => toggleBlock(userNC.UserID)}>Débloquer</button>
                      ) : (
                        <button className='btn btn-sm btn-primary' onClick={(e) => invitIns(e, userNC.UserID)}>Ajouter</button>
                      )}
                    </div>
                  </div>
                </div><hr className='m-0' />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='modal fade' id='invitR' tabIndex='-1' aria-labelledby='exampleModalLabel' aria-hidden='true'>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h4 className='modal-title text-primary' id='exampleModalLabel'>Demandes</h4>
              <button className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
            </div>
            <div className='modal-body'>
              {invitR.length !== 0 ? invitR.map((invitR, index) => (
                <div key={index + 1}><hr className='m-0' />
                  <div className='btn d-grid'>
                    <div className='row'>
                      <div className='col-md-2'><img src={invitR?.UserImg ? invitR?.UserImg : 'favicon.ico'} alt='' width={37.5} height={37.5} style={{ borderRadius: 37.5 }} /></div>
                      <div className='col-md-8 m-auto' style={{ width: 'auto' }}>
                        <h6 className='m-0'>{invitR?.UserFName} {invitR?.UserLName}</h6>
                        <div style={{ fontSize: '62%' }}>{moment(invitR?.createdAt).fromNow()}</div>
                      </div>
                      <div className='col-md-2 my-auto ms-auto'><button className='btn-close' onClick={(e) => invitDelByR(e, invitR)}></button></div>
                    </div>
                  </div><hr className='m-0' />
                </div>
              )) : (
                <div className='text-center'>
                  <span>
                    Aucune demande pour le moment...
                  </span>
                </div>
              )}
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-sm btn-secondary' data-bs-dismiss='modal'>Fermer</button>
            </div>
          </div>
        </div>
      </div>
      <div className='modal fade' id='invitS' tabIndex='-1' aria-labelledby='exampleModalLabel' aria-hidden='true'>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h4 className='modal-title text-primary' id='exampleModalLabel'>Invitations</h4>
              <button className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
            </div>
            <div className='modal-body'>
              {invitS.length !== 0 ? invitS.map((invitS, index) => (
                <div key={index + 1}><hr className='m-0' />
                  <div className="btn d-grid">
                    <div className='row'>
                      <div className='col-md-2'><img src={invitS?.UserImg ? invitS?.UserImg : 'favicon.ico'} alt='' width={37.5} height={37.5} style={{ borderRadius: 37.5 }} /></div>
                      <div className='col-md-6 m-auto' style={{ width: 'auto' }}>
                        <h6 className='m-0'>{invitS?.UserFName} {invitS?.UserLName}</h6>
                        <div style={{ fontSize: '62%' }}>{moment(invitS?.createdAt).fromNow()}</div>
                      </div>
                      <div className='col-md-3 my-auto ms-auto'><button className='btn btn-sm btn-primary' onClick={(e) => chatIns(e, invitS)}>Accepter</button></div>
                      <div className='col-md-1 my-auto' style={{ width: 'auto' }}><button className='btn-close' onClick={(e) => invitDelByS(e, invitS)}></button></div>
                    </div>
                  </div><hr className='m-0' />
                </div>
              )) : (
                <div className='text-center'>
                  <span>
                    Aucune invitation pour le moment...
                  </span>
                </div>
              )}
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-sm btn-secondary' data-bs-dismiss='modal'>Fermer</button>
            </div>
          </div>
        </div>
      </div>
      <div className='modal fade' id='userUpd' tabIndex='-1'>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h4 className=' modal-title text-warning'>Modification de compte</h4>
              <button className='btn-close' data-bs-dismiss='modal'></button>
            </div>
            <form onSubmit={(e) => userUpd(e, curUID)}>
              <div className='modal-body'>
                <div className='row mb-3'>
                  <div className='col-md-4'>
                    <label className='col-form-label-sm'>Nom :</label>
                  </div>
                  <div className='col-md-8'>
                    <input className='form-control form-control-sm' name='UserFName' value={UserFName} onChange={inputChange} />
                  </div>
                </div>
                <div className='row mb-3'>
                  <div className='col-md-4'>
                    <label className='col-form-label-sm'>Prenom :</label>
                  </div>
                  <div className='col-md-8'>
                    <input className='form-control form-control-sm' name='UserLName' value={UserLName} onChange={inputChange} />
                  </div>
                </div>
                <div className='row mb-3'>
                  <div className='col-md-4'>
                    <label className='col-form-label-sm'>Image :</label>
                  </div>
                  <div className='col-md-8'>
                    <input type='file' className='form-control form-control-sm' onChange={(e) => fileRead(e)} accept='.jpeg, .png, .jpg' />
                  </div>
                </div>
                <div className='row mb-3'>
                  <div className='col-md-4'>
                    <label className='col-form-label-sm'>Utilisateur :</label>
                  </div>
                  <div className='col-md-8'>
                    <input className='form-control form-control-sm' name='UserName' value={UserName} onChange={inputChange} />
                  </div>
                </div>
                <div className='row'>
                  <div className='col-md-4'>
                    <label className='col-form-label-sm'>Mot de passe :</label>
                  </div>
                  <div className='col-md-8'>
                    <input type='password' className='form-control form-control-sm' name='userPword' value={userPword} onChange={inputChange} />
                  </div>
                </div>
              </div>
              <div className='modal-footer'>
                <button type='submit' className='btn btn-sm btn-warning text-light'>Modifier</button>
                <button type='button' className='btn btn-sm btn-secondary' data-bs-dismiss='modal'>Fermer</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className='modal fade' id='logout' tabIndex='-1' aria-labelledby='exampleModalLabel' aria-hidden='true'>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h4 className='modal-title text-primary' id='exampleModalLabel'>Deconnexion</h4>
              <button className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
            </div>
            <div className='modal-body text-center'>
              <h6>Voulez-vous vraiment deconnecter votre compte, {curUFN} {curULN} ?</h6>
            </div>
            <div className='modal-footer'>
              <button className='btn btn-sm btn-primary' onClick={Logout}>Se deconnecter</button>
              <button type='button' className='btn btn-sm btn-secondary' data-bs-dismiss='modal'>Fermer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat;