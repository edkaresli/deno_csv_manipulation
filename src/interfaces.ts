export type Gender = "Male" | "Female"; 

export interface Connection {
    user: string;
    hostname: string;
    database: string;
    password: string;
    port: number;
}