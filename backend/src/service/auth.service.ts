import prisma from "../config/prisma.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import { LoginDto, SignupDto } from "../types/auth.types.js";
import { generateAccessToken, generateRefreshToken, JwtPayload,verifyRefreshToken } from "../utils/jwt.js";
import { hashPassword } from "../utils/password.js";
import { hashToken } from "../utils/token.js";
import { comparePassword } from "../utils/password.js";

export class AuthService {
  
  constructor(private authRepository = new AuthRepository()) {}

  async signup(data: SignupDto) {
    const name = data.name.trim();
const companyName = data.companyName.trim();
const email = data.email.trim().toLowerCase();

    const existingUser =
      await this.authRepository.findUserByEmail(email);

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword =
      await hashPassword(data.password);

    return prisma.$transaction(async (tx: any) => {
      const workspace =
        await this.authRepository.createWorkspace(
          tx,
          companyName
        );

      const user =
        await this.authRepository.createUser(tx, {
          name: name,
          email: email,
          password: hashedPassword,
          workspaceId: workspace.id,
        });

    const jwtPayload: JwtPayload = {
    userId:user.id,
    workspaceId:workspace.id,
    email:user.email
}
      const accessToken =
        generateAccessToken(jwtPayload);

      const refreshToken =
        generateRefreshToken(jwtPayload);

      await this.authRepository.createRefreshToken(tx, {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
      });
const safeUser = {
  id: user.id,
  name: user.name,
  email: user.email,
  workspace: {
    id: user.workspace.id,
    companyName: user.workspace.companyName,
  },
};
  return {
  accessToken,
  refreshToken,
  user: safeUser,
};
    });
  }



async login(data: LoginDto) {
  const email = data.email.trim().toLowerCase();

  const user = await this.authRepository.findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(
    data.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const payload = {
    userId: user.id,
    workspaceId: user.workspace.id,
    email: user.email,
  };

  const accessToken = generateAccessToken(payload);

  const refreshToken = generateRefreshToken(payload);

  await this.authRepository.createRefreshToken(prisma, {
    tokenHash: hashToken(refreshToken),
    userId: user.id,
    expiresAt: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      workspace: user.workspace,
    },
  };
}

async refresh(refreshToken: string) {

  const tokenHash = hashToken(refreshToken);


  const storedToken =
    await this.authRepository.findRefreshToken(
      tokenHash
    );


  if (!storedToken) {
    throw new Error("Invalid refresh token");
  }


  if (
    storedToken.expiresAt < new Date()
  ) {
    throw new Error("Refresh token expired");
  }


  const payload =
    verifyRefreshToken(refreshToken);


  const accessToken =
    generateAccessToken({
      userId: storedToken.user.id,
      workspaceId: storedToken.user.workspaceId,
      email: storedToken.user.email,
    });


  return {
    accessToken,
  };
}
}