
import { DTOAPI } from '../dto/dto.api';
import { DTOConfig } from '../dto/dto.config';
import { ApiMethodType } from '../enum/export.enum';
import { Ps_UtilObjectService } from '../utilities/utility.object';
import { Ps_CoreFunction } from './core.function';


export var APIList_IDServer = {
    //api đăng nhập lấy token
    apiToken() {
        if (Ps_UtilObjectService.hasValue(Ps_CoreFunction.getApiToken)) {
            return Ps_CoreFunction.getApiToken()
        } else {
            throw "getApiToken no implement";
        }
        // return new DTOAPI({
        //     url: DTOConfig.appInfo.apiid + 'connect/token',
        //     method: ApiMethodType.post
        // });
    },
    //api refresh token
    apiRefreshToken() {
        if (Ps_UtilObjectService.hasValue(Ps_CoreFunction.getApiRefreshToken)) {
            return Ps_CoreFunction.getApiRefreshToken()
        } else {
            throw "apiRefreshToken no implement";
        }
        // return new DTOAPI({
        //     url: DTOConfig.appInfo.apiid + 'api/Account/RefreshToken',
        //     method: ApiMethodType.post
        // });
    },
    //api thiết lập mật khẩu người dùng
    apiSetPassword() {
        if (Ps_UtilObjectService.hasValue(Ps_CoreFunction.getApiSetPassword)) {
            return Ps_CoreFunction.getApiSetPassword()
        } else {
            throw "getApiSetPassword no implement";
        }
        // return new DTOAPI({
        //     url: DTOConfig.appInfo.apiid + 'api/Account/SetPassword',
        //     method: ApiMethodType.post
        // });
    },
    //api đổi mật khẩu người dùng
    apiChangePassword() {
        if (Ps_UtilObjectService.hasValue(Ps_CoreFunction.getApiChangePassword)) {
            return Ps_CoreFunction.getApiChangePassword()
        } else {
            throw "getApiChangePassword no implement";
        }
        // return new DTOAPI({
        //     url: DTOConfig.appInfo.apiid + 'api/Account/ChangePassword',
        //     method: ApiMethodType.post
        // });
    },
    getUserInfo() {
        return new DTOAPI({
            url: DTOConfig.appInfo.apiid + "identity/getuserinfo",
            method: ApiMethodType.get
        });
    },
}