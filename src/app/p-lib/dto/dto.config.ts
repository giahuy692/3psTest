import { BehaviorSubject } from 'rxjs';
import { DTOStaff } from '..';
import { DTOToken } from './dto.token';

export class DTOConfig {
    static  idServer: {
        client_id:string;
        client_secret: string;
        scope: string;
        grant_type: string;                  
      }
    static Authen:{
        isLogin: boolean;
        token:DTOToken;
        refreshTokenInProgress:boolean;
        refreshTokenSubject: BehaviorSubject<any>;
        userinfo: DTOStaff
    }
    static appInfo: {
        apiid: string;
        apiec: string;
        apiconf: string;
        apibi: string;
        apicnb: string;
        apimar:string;
        apierp:string;
        apiwms:string;
        apisyn:string;
        apiecHachi:string;
        apiHachi:string;
        apires:string;
        res:string;
        urlLogin:string;
    };
    static cache: {
        timerPermission: number;
        timerApi: number;
        companyid?: string;
        dataPermission?: string;
    }
}