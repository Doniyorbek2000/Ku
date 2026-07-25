import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { signToken } from '../../lib/jwt.js';
import type { Role } from '../../lib/enums.js';
import { Errors } from '../../lib/errors.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/error.js';

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 belgi"),
  phone: z.string().min(7, "Telefon raqami noto'g'ri"),
  password: z.string().min(6, 'Parol kamida 6 belgi'),
});

// Xaridor ro'yxatdan o'tadi (mobil ilova)
authRouter.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, phone, password } = req.body as z.infer<typeof registerSchema>;
    const exists = await prisma.user.findUnique({ where: { phone } });
    if (exists) throw Errors.conflict('Bu telefon raqami allaqachon ro‘yxatdan o‘tgan');

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        role: 'CUSTOMER',
        passwordHash: await bcrypt.hash(password, 10),
      },
    });
    const token = signToken({ sub: user.id, role: user.role as Role, organizationId: null });
    res.status(201).json({ token, user: publicUser(user) });
  }),
);

const loginSchema = z.object({
  login: z.string().min(3, 'Telefon yoki email kiriting'), // telefon yoki email
  password: z.string().min(1, 'Parol kiriting'),
});

// Barcha rollar uchun kirish (telefon yoki email)
authRouter.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { login, password } = req.body as z.infer<typeof loginSchema>;
    const user = await prisma.user.findFirst({
      where: { OR: [{ phone: login }, { email: login.toLowerCase() }] },
    });
    if (!user || !user.isActive) throw Errors.unauthorized("Login yoki parol noto'g'ri");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw Errors.unauthorized("Login yoki parol noto'g'ri");

    const token = signToken({
      sub: user.id,
      role: user.role as Role,
      organizationId: user.organizationId,
    });
    res.json({ token, user: publicUser(user) });
  }),
);

// Joriy foydalanuvchi
authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw Errors.notFound('Foydalanuvchi topilmadi');
    res.json({ user: publicUser(user) });
  }),
);

function publicUser(u: {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: string;
  organizationId: string | null;
}) {
  return {
    id: u.id,
    name: u.name,
    phone: u.phone,
    email: u.email,
    role: u.role,
    organizationId: u.organizationId,
  };
}
