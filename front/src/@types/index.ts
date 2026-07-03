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

export interface addStudentType {
    full_name: string
    phone?: string
    parent_name?: string
    parent_phone?: string
}

export interface studentGroupType {
    id: number
    name: string
    subject: string
}

export interface allStudentType {
    id: number
    full_name: string
    phone: string | null
    parent_name: string | null
    parent_phone: string | null
    teacher_id: number
    created_at: string
    groups: studentGroupType[]
}
