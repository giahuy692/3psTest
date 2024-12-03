export class DTODeadLink {
    Code: number = 0
    TypeOfDeadLink: number = 0//0 = bai viet, 1 = san pham
    Description: string = ''
    OldLink: string = ''
    NewLink: string = ''

    constructor(){
        this.TypeOfDeadLink = 0
    }
}