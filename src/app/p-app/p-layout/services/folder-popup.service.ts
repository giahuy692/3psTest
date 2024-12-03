import { Injectable } from "@angular/core";
import { Ps_UtilObjectService } from "src/app/p-lib";

export interface IGraphServices {
    setGraphData(a: any)
    getGraphData(b?: any): any;
    setCache(c: any)
    getCache(): any;
}
//todo đổi tên cho có liên quan đến folder popup
@Injectable()
export class EmployeeAttendanceService implements IGraphServices {
    a: any;
    cache: any;

    setGraphData(a) {
        this.a = a
    }

    getGraphData(b?) {
        if (Ps_UtilObjectService.hasValue(b))
            return this.a(b)//"Employee Attendance Data";
        else
            return this.a
    }

    setCache(c) {
        this.cache = c
    }

    getCache() {
        return this.cache
    }
}

@Injectable()
export class ProductSalesService implements IGraphServices {
    a: any;
    cache: any;

    setGraphData(a) {
        this.a = a
    }

    getGraphData(b?) {
        if (Ps_UtilObjectService.hasValue(b))
            return this.a(b)//"Product Sales Data";
        else
            return this.a
    }

    setCache(c) {
        this.cache = c
    }

    getCache() {
        return this.cache
    }
}