import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { DTOResponse, PS_CommonService, Ps_UtilCacheService, Ps_UtilObjectService } from "src/app/p-lib";
import { HriApiConfigService } from "./hri-api-config.service";
import { DTOQuizSession } from "../dto/DTOQuizSession.dto";
import { LayoutService } from "src/app/p-app/p-layout/services/layout.service";
import { HriQuizSessionsAPIService } from "./hri-quiz-session-api.service";
import { State } from "@progress/kendo-data-query";
import { concatMap, finalize, tap } from "rxjs/operators";
import { DTOExam } from "../dto/DTOExam.dto";

@Injectable({
    providedIn: 'root'
})

export class HriQuizSessionService {
    //Stream data
    public QuizSession$: BehaviorSubject<DTOQuizSession> = new BehaviorSubject<DTOQuizSession>(new DTOQuizSession());
    private ListQuizSession$: BehaviorSubject<DTOQuizSession[]> = new BehaviorSubject<DTOQuizSession[]>([]);
    public ExamSession$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    //bool
    loading: boolean = false;

    keyCacheQuizSession: string = 'quizSession'


    constructor(
        public api: PS_CommonService,
        public config: HriApiConfigService,
        private cacheService: Ps_UtilCacheService,
        private layoutService: LayoutService,
        private sessionAPIService: HriQuizSessionsAPIService,
    ) { }

    CalculateMarkQuiz(qsCode: number) {
        var dto = { QuizSession: qsCode }
        return new Observable<DTOResponse>(obs => {
            this.sessionAPIService.CalculateMarkQuiz(dto).subscribe((res) => {
                if (res.ErrorString != null) this.layoutService.onError(`Đã xảy ra lỗi khi tính điểm đợt đánh giá: ${res.ErrorString}`);
                this.layoutService.onSuccess('Thành công tính điểm đợt đánh giá.', 2000)
                obs.next(res);
                obs.complete();
            }, (err) => {
                this.layoutService.onError(`Đã xảy ra lỗi khi tính điểm đợt đánh giá: ${err}`, 2000);
                obs.next(err);
                obs.complete();
            }
            )
        })
    }

    //GetCache Quiz session
    GetCacheQuizSession(): Observable<DTOQuizSession> {
        return new Observable(obs => {
            this.cacheService.getItem(this.keyCacheQuizSession).subscribe(res => {
                if (Ps_UtilObjectService.hasValue(res))
                    obs.next(JSON.parse(res.value).value);
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

    //Set cache quiz session
    setCacheQuizSession(data: DTOQuizSession): void {
        this.cacheService.setItem(this.keyCacheQuizSession, data);
    }

    GetListQuizSession(filter: State) {
        this.loading = true;
        return new Observable<DTOResponse>(obs => {
            this.sessionAPIService.GetListQuizSession(filter).subscribe(
                (res) => {
                    if (Ps_UtilObjectService.hasValue(res) && res.StatusCode === 0 && Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
                        this.loading = false;
                        this.ListQuizSession$.next(res.ObjectReturn.Data);
                        obs.next(res);
                        obs.complete();
                    } else if (Ps_UtilObjectService.hasValue(res) && res.ErrorString != null) {
                        this.loading = false;
                        this.layoutService.onError(`Đã xảy ra lỗi khi load danh sách đợt đánh giá: ${res.ErrorString}`);
                        obs.next(res);
                        obs.complete();
                    }
                }, (err) => {
                    this.loading = false;
                    this.layoutService.onError(`Đã xảy ra lỗi khi load danh sách đợt đánh giá: ${err}`);
                    obs.next(err);
                    obs.complete();
                }
            )
        })
    }

    //Update quiz session
    UpdateQuizSession(updatedQuiz: DTOQuizSession, propName: string[]) {
        this.loading = true;
        return new Observable<DTOResponse>(obs => {
            this.sessionAPIService.UpdateQuizSession(updatedQuiz, propName).subscribe(
                (res) => {
                    if (Ps_UtilObjectService.hasValue(res) && res.StatusCode === 0 && Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
                        this.loading = false;
                        this.layoutService.onSuccess('Cập nhật thông tin đợt đánh giá thành công');
                        // this.QuizSession$.next(res.ObjectReturn)
                        // this.setCacheQuizSession(res.ObjectReturn)
                        obs.next(res);
                        obs.complete();
                    } else if (Ps_UtilObjectService.hasValue(res) && res.ErrorString != null) {
                        this.loading = false;
                        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin đợt đánh giá: ${res.ErrorString}`);
                        obs.next(res);
                        obs.complete();
                    }
                }, (err) => {
                    this.loading = false;
                    this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin đợt đánh giá: ${err}`);
                    obs.next(err);
                    obs.complete();
                }
            )
        })
    }

    //Hàm update và gọi lấy danh sách đợt đánh giá tuần tự
    UpdateAndGetListQuizSession(updatedQuiz: DTOQuizSession, propName: [], filter: State) {
        return this.UpdateQuizSession(updatedQuiz, propName).pipe(
            concatMap(() => this.GetListQuizSession(filter)),
        )
    }

    //Return stream data as observable to tracking change value
    getQuizSession$(): Observable<DTOQuizSession> {
        return this.QuizSession$.asObservable();
    }

    setQuizSession(res) {
        this.QuizSession$.next(res)
        this.setCacheQuizSession(res)
    }

    setIntitialQuizSession(): void {
        const newQuizSession = new DTOQuizSession();
        this.QuizSession$.next(newQuizSession);
        this.setCacheQuizSession(newQuizSession)
    }
}
