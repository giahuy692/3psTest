import { EventEmitter, Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { PS_CommonService } from "src/app/p-lib";
import { UntypedFormBuilder } from '@angular/forms';
import { State, filterBy, orderBy } from '@progress/kendo-data-query';
import { DomSanitizer } from '@angular/platform-browser';
import * as XLSX from 'xlsx';

import { Payslip } from 'src/app/p-app/p-hri/shared/dto/payslip';
import { DTOEmployee, DTOEmployeeDetail } from "../dto/DTOEmployee.dto";
import { Ps_UtilCacheService,Ps_UtilObjectService } from "src/app/p-lib";
import { DTOQuestion } from "../dto/DTOQuestion.dto";
import { BehaviorSubject } from "rxjs";
import { DTOCompetenceFramework } from "../dto/DTOCompetenceFramework.dto";
import { DTOPersonalInfo } from "../dto/DTOPersonalInfo.dto";

@Injectable({
    providedIn: 'root'
})
export class PayslipService {
	private _menuStaff$: Observable<DTOEmployeeDetail>;

	private _menuStaffObserver: Subject<DTOEmployeeDetail> = new Subject<DTOEmployeeDetail>();
	
	private reloadSuccessSource: Subject<void> = new Subject<void>();

	public reloadSuccess$: Observable<void> = this.reloadSuccessSource.asObservable();
  
    //
	private _dataLoaded = false;

	excelValid: boolean = true
	importDialogOpened: boolean = false
    context: string
    //
    payslip = new Payslip()
    //Grid view
    pageSize: number = 24
    gridDSView = new Subject<any>();
    //Grid state
    gridDSState: State = {
        skip: 0, take: 20,
        filter: { filters: [], logic: 'or' },
        group: [],
        sort: [{ field: 'Code', dir: 'asc' }]
    };
	
    keyCacheStaff = 'staff'
	keyCacheQuestion = 'question'
    isLockAll: boolean = false
    
    constructor(
        public api: PS_CommonService,
        public sanitizer: DomSanitizer,
        public formBuilder: UntypedFormBuilder,
        public cacheService: Ps_UtilCacheService,
		
    ) {
		this._menuStaff$ = new Observable<DTOEmployeeDetail>((observer) => {
			this._menuStaffObserver.subscribe(observer);
		});
	 }
    //context
    setContext(context) {
        this.context = context;
    }
    getContext() {
        return this.context
    }
    //
    setPayslip(payslip) {
        this.payslip = payslip
    }
    getPayslip() {
        return this.payslip
    }
	//import dialog
	setImportDialog(importDialogOpened: boolean) {
		this.importDialogOpened = importDialogOpened
	}
	getImportDialog() {
		return this.importDialogOpened
	}
	//excel
	setExcelValid(excelValid: boolean) {
		this.excelValid = excelValid
	}
	getExcelValid() {
		return this.excelValid
	}
    //
    setPageSize(pageSize) {
        this.pageSize = pageSize
    }
    //loading
    loadList(itemBannerList, filterList, gridDSView, gridDSState) {
        filterList = filterBy(itemBannerList, gridDSState.filter)

        gridDSView.next({
            data: orderBy(filterList
                .slice(gridDSState.skip,
                    gridDSState.skip + this.pageSize),
                gridDSState.sort),
            total: filterList.length
        });
    }
    loadListExcel(importBannerList, filterImportList, importGridDSView, importGridDSState) {
        filterImportList = filterBy(importBannerList, importGridDSState.filter)

        importGridDSView.next({
            data: orderBy(filterImportList
                .slice(importGridDSState.skip,
                    importGridDSState.skip + this.pageSize),
                importGridDSState.sort),
            total: filterImportList.length
        });
    }
    //onEdit và onDelete có khung như nhau nhưng khác số dòng code

    //updatebanner, addbanner, clearform có khung như nhau	
	//upload excel
	onUploadExcel<T>(e: any, importColumn: any[], type: new () => T): Observable<Array<T>> {
		return new Observable(obs => {
			try {
				var list = new Array<T>()
				const target: DataTransfer = <DataTransfer>(e.target);
				if (target.files.length !== 1) {
					// this.onError("Chỉ được chọn 1 File để Import")
				}
				const reader: FileReader = new FileReader()

				reader.onload = (e: any) => {
					const bStr: string = e.target.result
					const wb: XLSX.WorkBook = XLSX.read(bStr, { type: 'binary' })
					const wbName: string = wb.SheetNames[0]
					const ws: XLSX.WorkSheet = wb.Sheets[wbName]

					// let data = new Array<T>()
					// data = (XLSX.utils.sheet_to_json<T>(ws, { header: 1 }))
					
					let rowObj = new Array<T>()
					rowObj = XLSX.utils.sheet_to_json(ws)
					// console.log(rowObj)
					
					//loop đọc data của excel
					// for (let i = 1; i < data.length; i++) {
					// 	let item = data[i]
					// 	let obj = new type()
					// 	//copy từng cột của dòng excel qua property của object
					// 	for (let j = 0; j < importColumn.length; j++) {
					// 		let col: string = importColumn[j]
					// 		obj[col] = item[j]
					// 	}
					// 	list.push(obj)
					// }
					// this.onInfo("Vui lòng kiểm tra dữ liệu")
					obs.next(rowObj);
					obs.complete();
				}
				reader.readAsBinaryString(target.files[0])
			} catch (error) {
				this.excelValid = false
			}
		})
	}

	
	getEmployee(): Observable<DTOEmployeeDetail> {
		return this._menuStaff$;
	  }
	
	activeEmployee(employee: DTOEmployeeDetail) {
		this._menuStaffObserver.next(employee)
	}
	

	triggerReloadSuccess() {
		this.reloadSuccessSource.next();
	}
	
	isDataLoaded(): boolean {
		return this._dataLoaded;
	}
	
	setDataLoaded(loaded: boolean) {
		this._dataLoaded = loaded;
	}
	resetDataLoaded() {
		this._dataLoaded = false;
	}	
	
	p_getCacheStaff(): Observable<DTOEmployeeDetail> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheStaff).subscribe(res => {
				if (Ps_UtilObjectService.hasValue(res))
					obs.next(JSON.parse(res.value).value);
				else {
					obs.next(null);
				}
				obs.complete()
			}, () => {
				obs.next(null);
				obs.complete()
			});
		});
	}

	//getCache Staff
    getCacheStaff(): Observable<DTOEmployeeDetail> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheStaff).subscribe(res => {
				if (Ps_UtilObjectService.hasValue(res))
					obs.next(JSON.parse(res.value).value);
				else {
					obs.next(null);
				}
				obs.complete()
			}, () => {
				obs.next(null);
				obs.complete()
			});
		});
	}
	
	setCacheStaff(data: DTOEmployee | DTOEmployeeDetail ): void {
		this.cacheService.setItem(this.keyCacheStaff, data);
	}
	p_deleteCacheStaff(): void {
		this.cacheService.removeItem(this.keyCacheStaff);
	}

	getCacheQuestion(): Observable<DTOQuestion> {
		return new Observable(obs => {
			this.cacheService.getItem(this.keyCacheQuestion).subscribe(res => {
				if (Ps_UtilObjectService.hasValue(res))
					obs.next(JSON.parse(res.value).value);
				else {
					obs.next(null);
				}
				obs.complete()
			}, () => {
				obs.next(null);
				obs.complete()
			});
		});
	}
	
	setCacheQuestion(data: DTOQuestion): void {
		this.cacheService.setItem(this.keyCacheQuestion, data);
	}

	getCacheCompetenceframework(): Observable<DTOCompetenceFramework> {
        return new Observable(obs => {
            this.cacheService.getItem(this.keyCacheQuestion).subscribe(res => {
                if (Ps_UtilObjectService.hasValue(res))
                    obs.next(JSON.parse(res.value).value);
                else {
                    obs.next(null);
                }
                obs.complete()
            }, () => {
                obs.next(null);
                obs.complete()
            });
        });
    }
    
    setCacheCompetenceframework(data: DTOCompetenceFramework): void {
        this.cacheService.setItem(this.keyCacheQuestion, data);
    }
}
