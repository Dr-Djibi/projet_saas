import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'menma-vps-session-secret-key';

export interface SessionTokenPayload {
  userId: string;
  botId: string;
}

/**
 * Sign a JWT token for session pairing
 */
export function signToken(payload: SessionTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '10m' });
}

/**
 * Verify a JWT token for session pairing
 */
export function verifyToken(token: string): SessionTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionTokenPayload;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}
