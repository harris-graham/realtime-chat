import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const Login = async (req, res) => {
  try {
    const user = await User.findAll({
      where: { UserName: req.body.username }
    });
    const match = await bcrypt.compare(req.body.userpword, user[0].UserPword);
    if (!match) return res.status(400).json({ msg: "Mot de passe incorrect!" });
    const userid = user[0].UserID;
    const userfname = user[0].UserFName;
    const userlname = user[0].UserLName;
    const userimg = user[0].UserImg;
    const username = user[0].UserName;
    const usertype = user[0].UserType;
    const accesstoken = jwt.sign({ userid, userfname, userlname, userimg, username, usertype }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
    const refreshtoken = jwt.sign({ userid, username, usertype }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
    await User.update({ refreshToken: refreshtoken }, { where: { UserID: userid } });
    res.cookie('refreshToken', refreshtoken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ accesstoken });
  } catch (error) {
    res.status(404).json({ msg: "Utilisateur introuvable!" });
  }
}

export const Logout = async (req, res) => {
  const refreshtoken = req.cookies.refreshToken;
  if (!refreshtoken) return res.sendStatus(204);
  const user = await User.findAll({ where: { refreshToken: refreshtoken } });
  if (!user[0]) return res.sendStatus(204);
  const userid = user[0].UserID;
  await User.update({ refreshToken: null }, { where: { UserID: userid } });
  res.clearCookie('refreshToken');
  return res.sendStatus(200);
}