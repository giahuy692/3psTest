import { BehaviorSubject } from "rxjs";
import { ModuleDataItem } from "../dto/menu-data-item.dto";

//@dynamic
export class PS_LayOutHelper {
   
    public static GetRoutes(data: Array<ModuleDataItem>): Array<any> {
        let routes: Array<any> = [];
        data.forEach(item => {
            if (item.Path != undefined && item.Path != null) {
                routes.push({
                    path: item.Path,
                    loadChildren: item.LoadChildren
                });
            }
        });

        return routes;
    }
}