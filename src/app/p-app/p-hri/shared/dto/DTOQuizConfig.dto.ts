export class DTOQuizConfig {
        Code: number = 0
        CreateBy: string = ''
        CreateTime: Date
        LastModifiedBy: string = ''
        LastModifiedTime: Date
        Category: number = null
        CategoryPercentage: number = null
        CategoryQuestionEssay: number = null
        CategoryQuestionMultiple: number = null
        Competence: number = null
        CompetencePercentage: number = null
        CompetenceQuestionEssay: number = null
        CompetenceQuestionMultiple: number = null
        TotalQuestionEssay: number = null
        TotalQuestionMultiple: number = null
        CompetenceLevelID: number = 1
        Parent: number = null
        QuizSession: number = null
        OrderBy: number = null
        ListChild: DTOQuizConfig[] = []
        CategoryName: string = ''
        CompetenceName: string = ''
        CompetenceID: string = ''
        constructor() { }
}
