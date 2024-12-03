import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DTOMAPost_ObjReturn } from 'src/app/p-app/p-marketing/shared/dto/DTOMANews.dto';
import { Ps_UtilCacheService, Ps_UtilObjectService } from 'src/app/p-lib';

@Injectable({
    providedIn: 'root'
})
export class HriSalaryService {


    keyCacheNewsPost: string = 'HRPolicy'


    constructor(private cacheService: Ps_UtilCacheService,) { }

    private reloadComponentSource: Subject<void> = new Subject<void>();
    public reloadComponent$: Observable<void> = this.reloadComponentSource.asObservable();

    //Get Cache news
    getCacheNewsDetail(): Observable<DTOMAPost_ObjReturn> {
        return new Observable(obs => {
            this.cacheService.getItem(this.keyCacheNewsPost).subscribe(res => {
                if (Ps_UtilObjectService.hasValue(res)) {
                    obs.next(JSON.parse(res.value).value);
                }
                else {
                    obs.next(null);
                }
                obs.complete()
            }, () => {
                obs.next(null);
                obs.complete()
            })
        })
    }

    //Set cache news
    setCacheNewsDetail(data: DTOMAPost_ObjReturn): void {
        this.cacheService.setItem(this.keyCacheNewsPost, data);
    }

    ReloadComponent() {
        this.reloadComponentSource.next();
    }
}
