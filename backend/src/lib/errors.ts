// Boshqariladigan (kutilgan) xatolar uchun yagona sinf.
export class AppError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const Errors = {
  badRequest: (msg = "Noto'g'ri so'rov") => new AppError(400, 'BAD_REQUEST', msg),
  unauthorized: (msg = 'Avtorizatsiya talab qilinadi') =>
    new AppError(401, 'UNAUTHORIZED', msg),
  forbidden: (msg = "Ruxsat yo'q") => new AppError(403, 'FORBIDDEN', msg),
  notFound: (msg = 'Topilmadi') => new AppError(404, 'NOT_FOUND', msg),
  conflict: (msg = 'Ziddiyat') => new AppError(409, 'CONFLICT', msg),
};
