export class DTOPartner {
  Code: number = 0
  InvNo: string = ''
  VNName: string = ''
  ENName: string = ''
  JPName: string = ''
  ShortName: string = ''
  ParentID: number = null
  ParentName: string = ''
  Address: string = ''
  Country: number = null
  CountryName: string = ''
  Province: number = null
  ProvinceName: string = ''
  District: number = null
  DistrictName: string = ''
  Ward: number = null
  WardName: string = ''
  IsLocal: boolean = true
  IsForeign: boolean = false
  Tel: string = ''
  Fax: string = ''
  Website: string = ''
  InvName: string = ''
  InvAddress: string = ''
  ListPartner: DTOPartner[] = []

  constructor(args = {}) {
    Object.assign(this, args)
  }
}
