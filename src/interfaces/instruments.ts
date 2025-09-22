export interface Instrument {
    id?: number;
    user_id?: number;
    type: number;
    subtype: number;
    cut_off_day: number;
    payment_due_day: number;
    currency: string;
}