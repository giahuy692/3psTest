import { DTOCompany } from "src/app/p-app/p-developer/shared/dto/DTOCompany"

export class DTOPersonalInfo {
    Code: number = 0
    NationalityName: string = ''
    GenderName: string = ''
    EthnicName: string = ''
    ReligionName: string = ''
    MaritalName: string = ''
    EducationName: string = ''
    EduRankName: string = ''
    EduDegreeName: string = ''
    ProfileID: number = 0
    FirstName: string = ''
    MiddleName: string = ''
    LastName: string = ''
    NickName: string = ''
    Domicile: string = ''
    BirthPlace: string = ''
    IdentityNo: string = ''
    Gender: number = 0
    Nationality: number = 0
    Ethnic: number = 0
    Religion: number = 0
    Marital: number = 0
    BirthDay: number = 0
    BirthMonth: number = 0
    BirthYear: number = 0
    PITRegister: string = ''
    PITEffDate: string = ''
    PITCode: string = ''
    Education: number = 0
    EduRank: number = 0
    EduDegree: number = 0
    ExpertIn: string = ''
    Profession: string = ''
    Fullname : string = ''
    BirthDate: string = ''
    Email : string = ''
    Cellphone : string = ''
    UserName : string = ''
    ListCompany : DTOCompany[] = []
    Address : string = ''
    IsInCompany : boolean = false
    ImageThumb : string = ''
    Pwd : string = ''
}
export class DTOListHR {
    Code: number = 0
    TypeData: number = 0
    OrderBy: number = 0
    ListName: string = ''
    ListID: string = ''
}

export class DTOPersonalCertificate {
    TypeName: string = ''
    Code: number = 0
    ProfileID: number = 0
    CertificateNo: string = ''
    EffDate: Date | string
    ExpDate: Date | string
    Register: string = ''
    TypeData: number = 0
}
export class DTOPersonalContact {
    Code: number = 0
    Profile: number = 0
    Cellphone: string = ''
    OtherCellphone: string = ''
    IsCellPhoneZalo: boolean = false
    IsOtherCellphoneZalo: boolean = false
    Email: string = ''
    Emergency: string = ''
    EmergencyNo: string = ''
    EmergencyRelationship: string = ''
    SocialNetwork: string = ''
    OtherSocialNetwork: string = ''
    VoIP: string = ''
    SocialNetworkTypeData: number = 0
    OtherSocialNetworkTypeData: number = 0
    VoIPTypeData: number = 0
    OtherSocialNetworkTypeDataName: string = ''
    VoIPTypeDataName: string = ''
    SocialNetworkTypeDataName: string = ''
}
export class DTOPersonalAddress {
    TypeName: string = ''
    Code: number = 0
    Profile: number = 0
    Address: string = ''
    Country: number = 0
    Province: number = 0
    District: number = 0
    TypeData: number = 0
    CountryName: string = ''
    ProvinceName: string = ''
    DistrictName: string = ''
    WardName: string = ''
    Ward: number = 0
}

export class DTOListCountry {
    Code: number = 0
    VNName: string = ''
    ENName: string = ''
    JPName: string = ''
    VNOrigin: string = ''
    OrderBy: number = 0
}
// export class DTOListProvince{
//     Code: number = 0
//     ProvinceID:  string = ''
//     Country: number = 0
//     VNProvince: string = ''
//     ENProvince: string = ''
//     JPProvince: string = ''
//     OrderBy: number = 0
// }
// export class DTOListDistrict{
//     Code: number = 0
//     DistrictID:  string = ''
//     Province: number = 0
//     VNDistrict: string = ''
//     ENDistrict: string = ''
//     JPDistrict: string = ''
//     OrderBy: number = 0
// }