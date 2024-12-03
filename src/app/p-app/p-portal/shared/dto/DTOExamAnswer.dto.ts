export class DTOExamAnswer {
    Code: number;
    ExamQuestionID: number;
    OrderBy: number;
    AnswerID: number;
    CreateBy: string | null;
    CreateTime: string | null;
    LastModifiedBy: string;
    LastModifiedTime: string;
    Answer: string;
    IsRight: boolean;
    IsRow: boolean;
    RowID: number;
    Selected: boolean;
    ColumnID: number | null;
}