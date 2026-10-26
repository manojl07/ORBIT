const {parse} = require("cookie");
const {verifyAccessToken} = require('../utils/jwt')
const User = require('../models/user.model')


const socketAuth = async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if(!cookiesHeader){
      return next(new Error("Authentication required"))
    }

    const cookies = parse(cookieHeader);

    const accesToken = cookies.accesToken;

    if(!accessToken){
      return next(new Error("Authentication required"))
    }

    let decoded;

    try {
      decoded = verifyAccessToken(accesToken)
    } catch (error) {
      if(error.name === "TokenExiredError" || error.name === "JsonWebTokenError" || error.name === "NotBeforeError"){
        return next(new Error("Authentication failed"));
      }
      throw error;
    }

    if(!decoded?.id){
      return next(new Error("Authentication failed"));
    }
     /*
     * Confirm the authenticated user still exists.
     *
     * We don't trust the JWT alone for establishing
     * the application-level socket identity.
     */
    const user = await User.findById(decoded.id).select("_id username profileImg isVerified").lean();

    if(!user){
      return next(new Error("Authentication failed"));
    }
      /*
     * This becomes the trusted identity for everything
     * that happens through this socket.
     *
     * We NEVER accept senderId from the client.
     */
    socket.user = {
      id: user._id.toString(),
      username: user.username,
      profileImg: user.profileImg, 
      isVerified: user.isVerified,
    }
    return next();
  } catch (error) {
    console.error("Socket authentication error: ", error);
    return next(new Error("Authentication failed"));
  }
}

module.exports = socketAuth;