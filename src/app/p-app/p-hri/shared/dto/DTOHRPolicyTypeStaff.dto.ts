import { DTOHRPolicyLocation } from './DTOHRPolicyLocation.dto';
import { DTOHRPolicyPosition } from './DTOHRPolicyPosition.dto';

export class DTOHRPolicyTypeStaff {
  Code: number = 0;
  Parent?: number;
  Policy?: number;
  PolicyTask?: number;
  TypeStaff: number;
  TypeStaffName?: string = '';
  TypeData: number;
  Status?: number = 0;
  StatusName?: string = 'Đang soạn thảo';
  ListException: DTOHRPolicyLocation[] | DTOHRPolicyPosition[] = [];
}
