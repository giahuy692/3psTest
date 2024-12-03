
import { Pipe, PipeTransform } from "@angular/core";
import { Ps_UtilObjectService } from "src/app/p-lib";

@Pipe({ name: 'convertMinuteToString' })

export class ConvertMinuteToString implements PipeTransform {
    transform(inputSeconds: number) {
        if (inputSeconds != null && inputSeconds > 0) {
            let hours = Math.floor(inputSeconds / 3600);
            let minutes = Math.floor((inputSeconds % 3600) / 60);
            let seconds = inputSeconds % 60;
      
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          } else {
            return "00:00:00"; // Default value when input is not valid
        }
    }
}