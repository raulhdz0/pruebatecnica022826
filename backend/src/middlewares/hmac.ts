import { Request, Response, NextFunction } from "express";
import * as crypto from "crypto";
import { isNonceUsed, registerNonce } from "../helpers/nonceStore";

const SECRET = process.env.HMAC_SECRET || "supersecret";

const verifyHmac = (req: Request, res: Response, next: NextFunction): void => {
    const signature = req.headers["x-signature"] as string;
    const timestamp = req.headers["x-timestamp"] as string;
    const nonce = req.headers["x-nonce"] as string;

    if (!signature || !timestamp || !nonce) {
        res.status(401).json({ message: "Faltan headers de autenticación." });
        return;
    }

    // Validar que el request no sea muy viejo (5 minutos)
    const now = Date.now();
    const reqTime = parseInt(timestamp);
    if (Math.abs(now - reqTime) > 5 * 60 * 1000) {
        res.status(401).json({ message: "Request expirado." });
        return;
    }

    // Validar que el nonce no haya sido usado
    if (isNonceUsed(nonce)) {
        res.status(401).json({ message: "Nonce ya utilizado. Posible replay attack." });
        return;
    }

    // Reconstruir la firma
    const body = req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : "";
    const payload = `${timestamp}.${req.method}.${req.originalUrl}.${body}`;
    const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");

    if (signature !== expected) {
        res.status(401).json({ message: "Firma inválida." });
        return;
    }

    // Registrar el nonce como usado
    registerNonce(nonce);

    next();
};

export default verifyHmac;
