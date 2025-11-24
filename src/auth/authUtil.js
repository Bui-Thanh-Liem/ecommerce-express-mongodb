import JWT from "jsonwebtoken";

export const createTokenPair = async ({ payload, privateKey }) => {
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

    //
    return { accessToken, refreshToken };
  } catch (error) {
    return error;
  }
};
