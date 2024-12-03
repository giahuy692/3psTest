export default class DTOMANews_ObjReturn {
    Code: number = 0;
    Company: number;
    OrderBy: number;
    NewsCategory: number;

    NewID: string = '';
    TitleVN: string = '';
    TitleEN: string = '';
    TitleJP: string = '';

    SummaryVN: string = '';
    SummaryEN: string = '';
    SummaryJP: string = '';

    ContentVN: string = '';
    ContentEN: string = '';
    ContentJP: string = '';

    IsApproved: boolean = false;

    ImageLarge: string = '';
    ImageThumb: string = '';
    ImageSmall: string = '';
    ImageRaw1: string = '';
    ImageRaw2: string = '';

    ImageSetting1: string = '';
    ImageSetting2: string = '';
    ImageSetting3: string = '';
    ImageSetting4: string = '';
    ImageSetting5: string = '';

    CreateBy: string = '';
    LastModifiedBy: string = '';

    ExpiredDate: Date;
    LastModifiedTime: Date;
}
export class DTOMAPost_ObjReturn {
    Code: number = 0;
    Company: number;
    OrderBy: number = 1;
    StatusID: number = 0;
    NewsCategory: number;

    NewID: string = '';
    StatusName: string = 'Đang soạn thảo';
    NewsCategoryName: string = '';

    TitleVN: string = '';
    TitleEN: string = '';
    TitleJP: string = '';

    SummaryVN: string = '';
    SummaryEN: string = '';
    SummaryJP: string = '';

    ContentVN: string = '';
    ContentEN: string = '';
    ContentJP: string = '';

    IsApproved: boolean = false;

    ImageLarge: string = '';
    ImageThumb: string = '';
    ImageSmall: string = '';
    ImageRaw1: string = '';
    ImageRaw2: string = '';

    ImageSetting1: string = '';
    ImageSetting2: string = '';
    ImageSetting3: string = '';
    ImageSetting4: string = '';
    ImageSetting5: string = '';

    CreateBy: string = '';
    LastModifiedBy: string = '';
    ListTag: string = '';

    ExpiredDate: Date;
    LastModifiedTime: Date;

    PostDate: Date | string;
    CreateTime: Date;
    MetaTitle: string	= ""
	MetaKeyword: string	= ""
	MetaDescription: string =""
	MetaStatus: number = null
	MetaStatusName: string = ""
    ApprovedBy: string =''
    ApprovedTime: Date
}
export class DTOMACategory {
    Code: number;
    Count: number;
    TypeData: number;
    NewsCategory: string = '';
    ImageThumb: string = '';
}