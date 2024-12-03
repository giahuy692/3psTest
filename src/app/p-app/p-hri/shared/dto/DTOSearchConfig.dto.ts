export class DTOSearchCompetence {
    CategoryName: string = '';
    StatusName: string = '';
    Competence: string = '';
    ParentID: string = '';
    ParentName: string = '';
    TotalCompetenceQuestionEssay: number
    TotalCompetenceQuestionMultiple: number
    CategoryID: string = '';
    ListChild: DTOSearchCompetence[] = []
    ListSector: string = '';
    Code: number = 0;
    CompetenceID: string = '';
    CompetenceName: string = '';
    Parent: number
    Category: number
    Remark: string = '';
    TypeOfEvaluation: number
    StatusID: number = 0;
    CreateBy: string = '';
    CreateTime: string = '';
    LastModifiedBy: string = '';
    LastModifiedTime: string = '';
}

export class DTOSearchCategory {
    StatusName: string = '';
    ListChild: DTOSearchCategory[] = []
    ListCreators: any
    ListVerifiers: any
    ParentID: string = ''
    ParentName: string = ''
    TotalQuestionMultiple: number
    TotalQuestionEssay: number
    Code: number = 0;
    Remark: string = '';
    StatusID: number = 0;
    CreateBy: string = '';
    CreateTime: string = '';
    LastModifiedBy: string = '';
    LastModifiedTime: string = '';
    Parent: number
    CategoryID: string = '';
    CategoryName: string = '';
    LevelID: number = null
}