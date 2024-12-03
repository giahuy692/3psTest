import { DTOHRPolicyLocation } from './DTOHRPolicyLocation.dto';
import { DTOHRPolicyTypeStaff } from './DTOHRPolicyTypeStaff.dto';

export class DTOHRPolicyPosition {
  Code: number = 0;
  Parent?: number = null;
  Policy?: number = null;
  PolicyTask?: number = null;
  Position?: number = null;
  PositionName: string = '';
  PositionID?: string = '';
  IsLeader?: boolean = null;
  IsSupervivor?: boolean = null;
  TypeData: number=0;
  Status?: number = 0;
  StatusName: string = 'Đang soạn thảo';
  DepartmentName: string = '';
  ListLocation: DTOHRPolicyLocation[];
  ListException: DTOHRPolicyLocation[] | DTOHRPolicyTypeStaff[] = [];
}
