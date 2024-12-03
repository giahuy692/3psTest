import { DTOBase } from './dto.base';

export default class DTOUser extends DTOBase {
    Code: number;
    StaffID: string;
    LastName: string;
    MiddleName: string;
    FirstName: string;
    FullName: string;
    BriefName: string;
    ImageURL: string;
    FirstViews: string;
}

export class DTOStaff {
    defaultURL: string = ''
    email: string = ""
    fullName: string = ""
    phoneNumber: string = ""
    staffID: number = null
    userName: string = ""
}