import { DTOHRPolicyPosition } from './DTOHRPolicyPosition.dto';
import { DTOHRPolicyTypeStaff } from './DTOHRPolicyTypeStaff.dto';

export class DTOHRPolicyLocation {
  Code: number = 0;
  Parent: number = null;
  Policy: number = null;
  PolicyTask: number = null;
  Location: number = null;
  LocationName: string = '';
  LocationID: string = '';
  Status: number = 0;
  StatusName: string = 'Đang soạn thảo';
  IsChecked: boolean = true;
  TypeData: number = 0;
  ListException: DTOHRPolicyPosition[] | DTOHRPolicyTypeStaff[] = [];
}
