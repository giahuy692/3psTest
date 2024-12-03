import { DTOBase } from './dto.base';

export class DTOToken extends DTOBase {
    access_token: string;
    expires_in: number;
    token_type: string;
    refresh_token: string;
    clearData?: Function= () => {
        this.access_token = "";
        this.expires_in = 0;

        this.token_type = "";
        this.refresh_token = "";
    }
}