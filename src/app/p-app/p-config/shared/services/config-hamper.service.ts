import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DTOHamperRequest } from '../dto/DTOConfHamperRequest';

@Injectable({
  providedIn: 'root'
})
export class ConfigHamperService {
  
  private _hamperDetail$: Observable<DTOHamperRequest>;

	private _hamperDetailObserver: Subject<DTOHamperRequest> = new Subject<DTOHamperRequest>();
  private _productDrawer$;

  //load all component - breadcrumb
  private reloadComponentSource: Subject<void> = new Subject<void>();
	public reloadComponent$: Observable<void> = this.reloadComponentSource.asObservable();

  //load cố định 1 component
  private reloadListProduct: Subject<void> = new Subject<void>();
	public reloadList$: Observable<void> = this.reloadListProduct.asObservable();

  private reloadHamperProduct: Subject<void> = new Subject<void>();
	public reloadHamPro$: Observable<void> = this.reloadHamperProduct.asObservable();

  private reloadApplyCompany: Subject<void> = new Subject<void>();
	public reloadApplyCompany$: Observable<void> = this.reloadApplyCompany.asObservable();

  constructor(
    
    )
  {
    this._productDrawer$ = new BehaviorSubject<DTOHamperRequest>(null);
    this._hamperDetail$ = new Observable<DTOHamperRequest>((observer) => {
			this._hamperDetailObserver.subscribe(observer);
		});
  }

    getHamperRequest(): Observable<DTOHamperRequest> {
		  return this._hamperDetail$;
	  }
	
    activeHamper(hamper: DTOHamperRequest) {
		  this._hamperDetailObserver.next(hamper)
	  }

  public getProductInHamper() {
    return this._productDrawer$ ? this._productDrawer$.asObservable():null;
  }
  
  public activeProductInHamper(hamper: DTOHamperRequest) {
    if (this._productDrawer$) {
      this._productDrawer$.next(hamper);
    } else {
      console.error('_productDrawer$ is undefined');
    }
  }

  ReloadComponent() {
		this.reloadComponentSource.next();
	}
  ReloadList() {
		this.reloadListProduct.next();
	}
  ReloadHamPro() {
		this.reloadHamperProduct.next();
	}
  ReloadApplyCompany() {
		this.reloadApplyCompany.next();
	}
  


}
