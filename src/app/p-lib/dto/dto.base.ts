import { Ps_UtilObjectService } from '../utilities/utility.object';

export class DTOBase {

    constructor(opt?: any) {
        if (Ps_UtilObjectService.hasValue(opt)) {
            let that=this;
            for (let key in opt) {
                that[key] = opt[key];
            }
        }
    }
}
