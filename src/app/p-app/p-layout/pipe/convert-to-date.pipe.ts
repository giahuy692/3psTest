import { Pipe, PipeTransform } from '@angular/core';
import { Ps_UtilObjectService } from 'src/app/p-lib';

@Pipe({
  name: 'convertToDate'
})
export class ConvertToDatePipe implements PipeTransform {

  transform(value: string | Date): Date {
    if(Ps_UtilObjectService.hasValueString(value)){
      return new Date(value);
    }
    return null
  }

}
