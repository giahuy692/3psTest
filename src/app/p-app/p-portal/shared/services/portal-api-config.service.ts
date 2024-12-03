import { Injectable } from '@angular/core';
import { ApiMethodType, DTOAPI, DTOConfig } from 'src/app/p-lib';
import { EnumHR } from 'src/app/p-lib/enum/hr.enum';
//#endregion [end using]

@Injectable({
	providedIn: 'root'
})
export class  PortalApiConfigService{
    constructor() { }

    getAPIList() {
        return {
            //Danh sach dot danh gia
            GetListExam: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumHR.GetListExam
			}),
            GetListExamQuestion: new DTOAPI({
				method: ApiMethodType.post,
				url: EnumHR.GetListExamQuestion
			}),

            UpdateExamStatus: new DTOAPI({
                method: ApiMethodType.post,
				url: EnumHR.UpdateExamStatus
            }),
            UpdateExamResult: new DTOAPI({
                method: ApiMethodType.post,
				url: EnumHR.UpdateExamResult
            }),
            DeleteExamResult: new DTOAPI({
                method: ApiMethodType.post,
				url: EnumHR.DeleteExamResult
            })
        }
    }
}