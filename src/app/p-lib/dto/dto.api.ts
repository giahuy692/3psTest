import { ApiMethodType } from "../enum/api.methodtype";
import { DTOBase } from "./dto.base";

export class DTOAPI extends DTOBase {
    url: string;
    method: ApiMethodType;
}