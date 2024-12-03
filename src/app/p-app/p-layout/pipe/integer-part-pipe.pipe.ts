import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'integerPart' })

export class IntegerPartPipe implements PipeTransform {
  transform(value: any): string {
    // Chuyển đổi giá trị thành số nếu không phải là số
    let numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return value;
    }

    // Trả về phần nguyên của số và định dạng với dấu phẩy
    return Math.floor(numValue).toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
}
