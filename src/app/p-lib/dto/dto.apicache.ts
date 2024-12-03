import { DTOConfig } from './dto.config';

export class DTOAPICache {
    Data: any;
    Expire: number;

    public build(pData: any, isPer: boolean = false): boolean {
        if(DTOConfig.cache.timerApi > 0 && DTOConfig.cache.timerPermission > 0) {
            this.Data = pData;
            //10s
            
            if (!isPer)
                this.Expire = (new Date()).getTime() + DTOConfig.cache.timerApi * 1000;
            else {
                this.Expire = (new Date()).getTime() + DTOConfig.cache.timerPermission * 1000;
            }
            return true;
        }
        return false;
    }
    public checkExpire(): boolean {
        return this.Expire < (new Date()).getTime();
    }
    
}