import { DTOPartner } from "./DTOPartner";

export class DTOSupplier extends DTOPartner {
  Partner: number = null
  PartnerID: string = ''
  StatusID: number = 0
  StatusName: string = ''
  LastPO: string = null
  OrderBy: number = null
  ReasonID: number = null
  IsClosed: boolean = false
  TypeData: number = 1
  ReasonDetail: string = ''
  ListSuppliers: DTOSupplier[]
}