import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res) => {
  try {
    const refreshtoken = req.cookies.refreshToken;
    if (!refreshtoken) return res.sendStatus(401);
    const user = await User.findAll({ where: { refreshToken: refreshtoken } });
    if (!user[0]) return res.sendStatus(403);
    jwt.verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);
      const userid = user[0].UserID;
      const userfname = user[0].UserFName;
      const userlname = user[0].UserLName;
      const userimg = user[0].UserImg;
      const username = user[0].UserName;
      const usertype = user[0].UserType;
      const accessToken = jwt.sign({ userid, userfname, userlname, userimg, username, usertype }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
      res.json({ accessToken });
    });
  } catch (error) {
    console.log(error);
  }
}