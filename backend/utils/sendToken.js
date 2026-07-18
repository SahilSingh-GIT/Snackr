import jwt from "jsonwebtoken";

const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + (Number(process.env.JWT_EXPIRES_TIME) || 90) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: { user },
  });
};

export default sendToken;