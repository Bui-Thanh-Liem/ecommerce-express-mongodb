import JWT from "jsonwebtoken";

export const createTokenPair = async ({ payload, publicKey, privateKey }) => {
  try {
    // access token
    const accessToken = JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "2 days",
    });

    // refresh token
    const refreshToken = JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7 days",
    });

    // Test decode
    const accessTokenVerified = JWT.verify(accessToken, publicKey);
    const refreshTokenVerified = JWT.verify(refreshToken, publicKey);
    console.log("accessTokenVerified:::", accessTokenVerified);
    console.log("refreshTokenVerified:::", refreshTokenVerified);

    //
    return { accessToken, refreshToken };
  } catch (error) {
    return error;
  }
};
