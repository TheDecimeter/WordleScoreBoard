export interface CommentResponse {
    name: string,
    message: string,
    user: string
}

export interface GridResponse {
    [key: string]: string
}

export type WeekResponseObj = {
    [key: number]: GridResponse[]
} &
{
    comments: CommentResponse[]
}

export type WeekResponse = WeekResponseObj[];

export interface LastSave {
    user?: string;
    time?: string;
    grid?: string;
    day?: string;
    week?: string;
    count?: string;
}

export interface DayStruct {
    grid: string;
    day: string;
    comments: CommentResponse[];
}

export interface UserStruct {
    user: string;
    days: DayStruct[];
}

type NotAFunction = unknown extends any ? (any extends any ? (Function extends any ? never : any) : any) : any;