import { sign } from "jsonwebtoken";

export const createTokenPair = async ({ payload, publicKey, privateKey }) => {
  try {
    // access token
    const accessToken = await sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "2 days",
    });

    // refresh token
    const refreshToken = await sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7 days",
    });

    //
    return { accessToken, refreshToken };
  } catch (error) {
    return error;
  }
};
