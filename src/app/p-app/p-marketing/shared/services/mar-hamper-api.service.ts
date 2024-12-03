
import { DTOCFFolder } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { LayoutApiConfigService } from "src/app/p-app/p-layout/services/layout-api-config.service";
import { MarketingApiConfigService } from "./marketing-api-config.service";
import { Observable } from "rxjs";
import { PS_CommonService, Ps_UtilObjectService, DTOResponse, DTOConfig } from "src/app/p-lib";
import { State, toDataSourceRequest } from '@progress/kendo-data-query';

@Injectable({
    providedIn: 'root'
})
export class MarHamperAPIService {

    constructor(
        public api: PS_CommonService,
        public config: MarketingApiConfigService,
        public layoutConfig: LayoutApiConfigService,
    ) { }
}