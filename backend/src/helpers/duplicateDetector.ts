import { Op } from "sequelize";
import { Transfer } from "../models/index";

const DUPLICATE_WINDOW_MS = 60 * 1000; // 1 minuto

export const isDuplicateTransfer = async (
    from_user_id: string,
    to_user_id: string,
    amount: number
): Promise<boolean> => {
    const windowStart = new Date(Date.now() - DUPLICATE_WINDOW_MS);

    const existing = await Transfer.findOne({
        where: {
            from_user_id,
            to_user_id,
            amount,
            status: ["completed", "processing"],
            createdAt: {
                [Op.gte]: windowStart,
            },
        },
    });

    return existing !== null;
};
