interface DTOPayload {
    Code: string;
    QuizSession: number;
    StatusID: number
}

export interface DTOUpdateExamPayload {
    ListDTO: DTOPayload[];
    StatusID: number
}