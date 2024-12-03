import { DTOHRPolicyLocation } from './DTOHRPolicyLocation.dto';
import { DTOHRPolicyPosition } from './DTOHRPolicyPosition.dto';

export class DTOHRPolicyTypeStaff {
  Code: number = 0;
  Parent?: number = null;
  Policy?: number = null;
  PolicyTask?: number;
  TypeStaff: number = null;
  TypeStaffName?: string = '';
  TypeData: number = null;
  Status?: number = 0;
  StatusName?: string = 'Đang soạn thảo';
  ListException: DTOHRPolicyLocation[] | DTOHRPolicyPosition[] = [];
}
