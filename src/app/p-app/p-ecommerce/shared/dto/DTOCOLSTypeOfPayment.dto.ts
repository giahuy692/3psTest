export class DTOCOLSTypeOfPayment {
	Code: number
	TypeID?: string
	TypeOfPayment: string
	TypeData?: number
	OrderBy?: number
	Remark?: string
}


export default class DTOSynPayment {
	ID: number;
	Description: string = ''
	PaymentName: string = ''
	SortOrder: number = 0;
	ImageSetting1: string = '';
	ListBank: any[]//DTOBank[]

	constructor(ID?: number, PaymentName?: string) {
		this.ID = ID
		this.PaymentName = PaymentName
	}
}