export type ReminderRequest = {
    patient: string;
    date: Date;
    gender: string;
    meal_type: string;
    food_id: number;
    equivalents: number;
};