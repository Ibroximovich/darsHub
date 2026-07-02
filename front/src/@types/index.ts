export interface dataType {
    full_name?: string;
    email: string;
    password: string;
}

export interface addGroupType {
    name:string
    subject:string
    schedule:string

}
export interface allGroupType {
    id:number,
    name: string
    subject: string
    schedule: string
    teacher_id: number,
   

}
