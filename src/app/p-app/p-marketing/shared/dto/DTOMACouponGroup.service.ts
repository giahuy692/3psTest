export class DTOMACouponGroupService {
  Code?: number;
  OrderBy?: number;
  TypeData?: number;
  ParentID?: number;
  DefaultAmount?: number;
  
  Remark?: string;
  Prefix?: string = '';
  ParentPrefix?: string;
  VoucherType?: string;

  constructor(VoucherType: string = '', ParentPrefix: string = '') {
    this.Code = 0
    this.OrderBy = 1
    this.TypeData = 2
    this.DefaultAmount = 100
    this.VoucherType = VoucherType
    this.ParentPrefix = ParentPrefix
  }
}
