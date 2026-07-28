import { Request, Response } from "express";
import { AuthService } from "../service/auth.service.js";
import { setRefreshTokenCookie } from "../utils/cookie.js";
import { signupSchema } from "../validators/auth.validator.js";


export class AuthController {
  private authService = new AuthService();

  signup = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.signup(req.body);

      setRefreshTokenCookie(res, result.refreshToken);

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  login = async (req: Request, res: Response) => {
  try {
    const result = await this.authService.login(req.body);

    setRefreshTokenCookie(res, result.refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

refresh = async (
  req: Request,
  res: Response
) => {
  console.log("[Auth] Refresh request received");

  try {

    const refreshToken = req.cookies.refreshToken;

    console.log(
      "[Auth] Refresh token cookie present:",
      !!refreshToken
    );

    if (!refreshToken) {
      throw new Error("Refresh token missing");
    }

    const result =
      await this.authService.refresh(refreshToken);

    console.log("[Auth] New access token generated: true");

    return res.status(200).json({
      success: true,
      accessToken: result.accessToken
    });


  } catch(error: any) {

    console.log(
      "[Auth] Refresh token validation failed:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: error.message
    });

  }
};

me = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

}