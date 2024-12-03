
export class DTOResult<T> {
    Data?: Array<T>;
    Total?: number;

    constructor(opt: any) {
        if (!(opt === undefined || opt === null)) {
            for (let key in opt) {
                this[key] = opt[key];
            }
        }
    }
}