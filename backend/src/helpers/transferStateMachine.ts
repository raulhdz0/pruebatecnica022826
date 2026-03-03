import { TransferStatus, TRANSFER_STATUSES } from "../models/Transfer";

type TransitionMap = {
    [key in TransferStatus]: TransferStatus[];
};

const VALID_TRANSITIONS: TransitionMap = {
  pending: ["processing", "failed"],
  processing: ["completed", "failed"],
  completed: ["reversed"],
  failed: [],
  reversed: [],
};

export const canTransition = (from: TransferStatus, to: TransferStatus): boolean => {
    return VALID_TRANSITIONS[from].includes(to);
};

export const transition = (from: TransferStatus, to: TransferStatus): TransferStatus => {
    if (!canTransition(from, to)) {
        throw new Error(`Transición inválida: ${from} → ${to}.`);
    }
    return to;
};

export const isValidStatus = (status: string): status is TransferStatus => {
    return (TRANSFER_STATUSES as readonly string[]).includes(status);
};
