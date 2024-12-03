import { DTOChannelGroup } from "./DTOChannelGroup.dto";

export default class DTOChannel {
    Code: number = 0;
    ImageSetting: string = '';
    ChannelName: string = '';
    Brief: string = '';
    ParentID: number = null;
    ParentName: string = '';
    HighParentName: string = '';
    NumOfGroups: number = 0;
    NumOfChannels: number = 0;
    Priority: number = 1;
    Inhouse: boolean = false;
    IsChild: boolean = false;
    OrderBy: number = 1;
    StatusID: number = 0;
    StatusName: string = '';
    FromGroup: string = '';
    ToGroup: string = '';
    IsMove: boolean = false;

    InhouseName: string = '';
    NoOfOnsite: number = 0;
    NoOfWaiting: number = 1;
    CreatedBy: string = '';
    ApprovedBy: string = '';
    CreateTime: Date | string = null;
    ApprovedTime: Date | string = null;
}

export class DTOChannelProduct {
    Code: number = 0
    ProductImage?: string = ''
    ProductName?: string = ''
    Product?: number = 0
    Poscode?: string = ''
    Barcode?: string = ''
    NumOfOnsite?: number = 0
    NumOfNotOnsite?: number = 0
    NumOfOffsite?: number = 0
    IsRightToOnsite?: boolean = false
    ListOnSite?: DTOChannelOnsite[] = []
    ListGroup?: DTOChannelGroup[] = []
    Channel?: number = null
    ChannelGroup?: number = null
    GroupChannelID?: string = ''
    GroupChannelName?: string = ''
    ListIcon?: string[] = []
    StatusID?: number = 0
    StatusName?: string = ''
    Quantity?: number = 0
    MinQty?: number = 0
    MaxQty?: number = 0
    IsEdit?: boolean = false
    ApprovedTime?: Date | string = null
    IsAll?: boolean = true
    NumOfInventory?: number = 0
    IsOutDistributedStock?: boolean = false
    IsPoolStock?: boolean = true

    Price?: number = 0
    TypeData?: number = 1
    ImageSetting?: string = ''
    ChannelName?: string = ''
    ChannelSKUID?: number = null
    IsApproved?: boolean = false
    CreateBy?: string
    CreateTime?: Date | string = null
    ApprovedBy?: string
    LastModifiedTime?: Date | string = null
}

export class DTOChannelOnsite {
    Name: string = ''
    Choose: boolean = false
}