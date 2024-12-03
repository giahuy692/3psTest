export class DTOStatus {
	Code: number = 0
	StatusID?: number = 0
	StatusName?: string = 'Đang soạn thảo'
	TypeData?: number = 4
	OrderBy?: number = 0
	//dùng cho đơn hàng
	CreateBy?: string = ''
	CreateTime?: string|Date
}