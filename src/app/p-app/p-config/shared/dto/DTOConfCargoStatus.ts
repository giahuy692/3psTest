import { DTODetailConfProduct } from "./DTOConfProduct";

export class DTOCargoStatus extends DTODetailConfProduct {
    ProductImage: string = ''
    ListOrder: DTOStatusInfo[] = []
    ListLGT: DTOStatusInfo[] = []
    ListOnsite: DTOStatusInfo[] = []
    ListWholesale: DTOStatusInfo[] = []
    ListRetail: DTOStatusInfo[] = []
    IsOrder: boolean = false
    IsLGT: boolean = false
    IsOnsite: boolean = false
    IsWholesale: boolean = false
    IsRetail: boolean = false
}

export class DTOStatusInfo {
    Name: string = ''
    Choose: boolean = false
}