import { Pipe, PipeTransform } from "@angular/core";
import { Ps_UtilObjectService } from "src/app/p-lib";

@Pipe({ name: 'colorStatus' })

export class ColorStatusPipe implements PipeTransform {

    transform(statusName: string, statusID: number, typeData: number = 4) {
        if (Ps_UtilObjectService.hasValueString(statusName) && Ps_UtilObjectService.hasValue(statusID)) {
            switch (typeData) {
                case 4:
                    switch (statusID) {
                        case 0:
                            var text = `<div class='color-gray'>${statusName}</div>`
                            return text;
                        case 1:
                            var text = `<div class='color-blue'>${statusName}</div>`
                            return text;
                        case 2:
                            var text = `<div class='color-darkgreen'>${statusName}</div>`
                            return text;
                        case 3:
                            var text = `<div class='color-badred'>${statusName}</div>`
                            return text;
                        case 4:
                            var text = `<div class='color-mediumyellow'>${statusName}</div>`
                            return text;
                        default:
                            return statusName;
                    }

                case 13:
                    switch (statusID) {
                        case 1:
                            var text = `<div class='color-gray'>${statusName}</div>`
                            return text;
                        case 2:
                        case 3:
                            var text = `<div class='color-blue'>${statusName}</div>`;
                            return text;
                        case 4:
                        case 5:
                            var text = `<div class='color-mediumyellow'>${statusName}</div>`;
                            return text;
                        case 6:
                        case 8:
                        case 9:
                        case 11:
                            var text = `<div class='color-badred'>${statusName}</div>`;
                            return text;
                        case 7:
                        case 10:
                            var text = `<div class='color-darkgreen'>${statusName}</div>`;
                            return text;
                        default:
                            return statusName;
                    }

                case 14:
                    switch (statusID) {
                        case 2:
                            var text = `<div class='color-blue'>${statusName}</div>`;
                            return text;
                        case 7:
                            var text = `<div class='color-mediumyellow'>${statusName}</div>`;
                            return text;
                        case 3:
                        case 5:
                            var text = `<div class='color-badred'>${statusName}</div>`;
                            return text;
                        case 4:
                        case 6:
                        case 8:
                        case 9:
                            var text = `<div class='color-darkgreen'>${statusName}</div>`;
                            return text;
                        default:
                            return statusName;
                    }

                // Đề nghị
                case 15:
                    switch (statusID) {
                        case 1:
                            var text = `<div class='color-gray'>${statusName}</div>`
                            return text;

                        case 2:
                        case 3:
                            var text = `<div class='color-mediumyellow'>${statusName}</div>`;
                            return text;

                        case 4:
                            var text = `<div class='color-darkgreen'>${statusName}</div>`
                            return text;

                        case 5:
                        case 6:
                            var text = `<div class='color-badred'>${statusName}</div>`
                            return text;

                        default:
                            return statusName;
                    }

                //trạng thái nhân sự trong boarding
                case 16:
                    switch (statusID) {
                        case 1:
                            var text = `<div class='color-gray'>${statusName}</div>`
                            return text;
                        case 2:
                            var text = `<div class='color-orangeyellow'>${statusName}</div>`;
                            return text;
                        case 3:
                            var text = `<div class='color-badred'>${statusName}</div>`
                            return text;
                        case 4:
                            var text = `<div class='color-darkgreen'>${statusName}</div>`
                            return text;

                        default:
                            return statusName;
                    }
                default:
                    return statusName;

                //trạng thái công việc
                case 17:
                    switch (statusID) {
                        case 2:
                            var text = `<div class='hachi-color-primary-2'>${statusName}</div>`;
                            return text;
                        case 4:
                            var text = `<div class='color-lightblue'>${statusName}</div>`
                            return text;
                        case 5:
                            var text = `<div class='color-badred'>${statusName}</div>`
                            return text;
                        case 6:
                            var text = `<div class='color-darkgreen'>${statusName}</div>`
                            return text;

                        default:
                            return statusName;
                    }
            }

        } else {
            return statusName;
        }
    }
}