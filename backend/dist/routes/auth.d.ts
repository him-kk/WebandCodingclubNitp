declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                role: string;
            };
        }
    }
}
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=auth.d.ts.map