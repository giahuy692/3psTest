import { DTOGift } from './DTOGift'

export class DTOGiftProduct{
	Code: number
	PromotionID: number
	Max: number
	VName: string = ""
	EName: string = ""
	JName: string = ""
	ImageSetting1: string = ""
	ListOfGift: DTOGift[] = []
}