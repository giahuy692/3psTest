
export class Ps_URL_Service {
    moduleIP: string

    constructor(moduleIP: string) {
        this.moduleIP = moduleIP
    }

    public GetURLfromEnum(apiEnum) {
        return this.moduleIP + apiEnum
    }
}