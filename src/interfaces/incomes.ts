export interface Income {
    id?: number;
    user_id?: number;
    source: number;
    description: string;
    amount: number;
    frequency: number;
    currency: string;
}