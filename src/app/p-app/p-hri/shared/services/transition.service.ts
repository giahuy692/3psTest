import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransitionService {
  private dataSubjectImport = new BehaviorSubject<any>(null);
  constructor() { }
  
  /**
   * Hàm để thực hiện lấy status để mở popup import
   * @returns 
   */
  getDataStatusImport() {
    return this.dataSubjectImport.asObservable();
  }

  /**
   * Hàm để set giá trị status cho popup imporm
   * @param value  0 chức danh, 1 công việc
   */
  setDataStatusImport(value: any) {
    this.dataSubjectImport.next(value);
  }
}
