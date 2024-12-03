export class DTOMetaTag {
    Code: number = 0
    CreateBy: string = ''
    CreateTime: Date | string
    LastModifiedBy: string = ''
    LastModifiedTime: string = ''
    MetaTitle: string = ''
    MetaKeyword: string = ''
    MetaDescription: string = ''
    MetaStatus: number = 0
    MetaStatusName: string = ''
    PageName: string = ''
    Category: number
    CategoryName: string = ''
    Alias: string = ''
}

export class DTOMetaTagCategory {
    Code: number //= 1
    Name: string = ''//= "Phân nhóm sản phẩm"
}
