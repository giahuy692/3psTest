import { DTOHRDecisionProfile } from './DTOHRDecisionProfile.dto';
import { DTOHRDecisionTaskLog } from './DTOHRDecisionTaskLog.dto';

export class DTOHRDecisionTask {
  Code: number = 0; // Mã công việc
  TaskName: string = ''; // Tên công việc
  Description: string = ''; // Mô tả công việc
  AssigneeBy: string = ''; // Tên chức danh / nhân sự thực hiện
  TypeAssignee: number = 0; // Enum loại đảm nhận công việc
  PositionApprovedName: string = ''; // Tên chức danh duyệt
  OrderBy: number = 0; // Thứ tự thực hiện
  DateDuration: number = 0; // Thời gian hoàn tất công việc
  PositionAssignee: number = null; // Mã chức danh thực hiện
  PositionApproved: number = null; // Mã chức danh duyệt
  IsLeaderMonitor: boolean = false; // Là trưởng đơn vị, quản lý điểm làm việc
  StartDate: string = ''; // Ngày bắt đầu
  EndDate: string = ''; // Ngày đến hạn
  Status: number = 0; // Mã trạng thái công việc
  DecisionProfile: number = null; // Mã hồ sơ trong quyết định
  Petition: number = null; // Mã đơn
  Task: number = null; // Mã công việc trong chính sách
  Remark: string = ''; // Ghi chú
  Assignee: number = null; // Mã nhân sự sẽ làm việc
  AssigneeName: string = ''; // Tên của nhân sự sẽ làm việc
  TypeData: number = null; // Enum loại công việc
  TypeDataName: string = ''; // Tên loại công việc
  AssigneeID: string = ''; // Mã nhân sự thực hiện
  AssigneePositionName: string = ''; // Tên chức danh thực hiện
  ListHRDecisionTaskLog?: DTOHRDecisionTaskLog[] = []; // Danh sách lịch sử trạng thái trước đó
  Approved: number = null; // Mã nhân sự duyệt
  ApprovedID: string = ''; // Mã nhân sự duyệt
  ApprovedName: string = ''; // Tên nhân sự duyệt
  ApprovedPositionName: string = ''; // Tên chức danh duyệt
  Recipient: number = null; // Mã chức danh người thụ hưởng
  RecipientPositionName: string = ''; // Tên chức danh người thụ hưởng
  RecipientStaffName: string = ''; // Tên người thụ hưởng
  RecipientStaffID: string = ''; // Mã người thụ hưởng
  ListChild: DTOHRDecisionTask[] = []; // Danh sách công việc con
  NumOfStaff: number = 0; // Số nhân sự
  NumOfBoarding: number = null; // Số vị trí boarding
  DecisionTypeName: string = ''; // Công việc từ đâu (Onboarding, Offboarding)
  TotalWorkingTask: number = null; // Số nhân sự đang thực hiện công việc
  TotalNotTask: number = null; // Số nhân sự không thực hiện công việc
  TotalPauseTask: number = null; // Số nhân sự ngưng thực hiện công việc
  TotalDoneTask: number = null; // Số nhân sự hoàn tất công việc
  TotalOverdueTask: number = null; // Số nhân sự quá hạn công việc
  TotalSentTask: number = null; // Số nhân sự đã gửi duyệt (chờ duyệt)
  ApprovedPositionID: string = ''; // Mã chức danh duyệt
  IsOverdue: boolean = false; // Công việc đã quá hạn?
  ListOfTypeStaff: string = null; // Enum loại nhân sự áp dụng
  FullName: string = ''; // Tên nhân sự boarding
  StaffID: number = null; // Mã nhân sự boarding
  TypeDecision: number = null; // Loại quyết định
  RemainingDate: Date = null; // Số ngày còn lại
  ListHRDecisionProfile?: DTOHRDecisionProfile[] = []; // Danh sách nhân sự áp dụng
  Reason: number = null; // Lý do ngưng, mở lại công việc
  ReasonDescription: string = ''; // Mô tả lý do ngưng, mở lại công việc
  ImageThumb: string = ''
  DepartmentName: string = ''
  LocationName: string = ''
  PositionName: string = ''
  ListStakeholder: any[] = []
  ListOfStakeholder: string =''
  ListOfTemplate: string = ''
  ListOfAttached: string = ''
  Decision: number = null
  CreatedTime?: string = '';


  //Phú thêm
  numOfTotalStakeholders?: number = 0
  titleStackHolder?: string = ''


}

// export const listTaskTest: DTOHRDecisionTask[] = [
//   {
//     Code: 1,
//     TaskName: "Công việc 1",
//     Description: "Bảng mô tả công việc sẽ bao gồm: tiêu đề công việc, mô tả chi tiết nội dung công việc, yêu cầu kỹ năng, trình độ học vấn",
//     AssigneeBy: "",
//     PositionApprovedName: "Chủ tịch",
//     OrderBy: 1,
//     DateDuration: 5,
//     PositionAssignee: 7,
//     TypeAssignee: 1,
//     PositionApproved: 3,
//     IsLeaderMonitor: false,
//     StartDate: "2024-10-20",
//     EndDate: "2024-12-20",
//     Status: 0,
//     DecisionProfile: 0,
//     Petition: 0,
//     Task: 0,
//     Remark: "",
//     Assignee: 1,
//     AssigneeName: "Đỗ Quốc Thành",
//     TypeData: 0,
//     TypeDataName: "",
//     AssigneeID: "NV0001",
//     AssigneePositionName: "Giám đốc",
//     ListHRDecisionTaskLog: [{
//       Code: 0,
//       DecisionTask: null,
//       Status: 3,
//       StatusName: "Đang thực hiện",
//       Reason: null,
//       ReasonName: "",
//       ReasonDescription: "",
//       OrderBy: 1,
//       CreatedBy: null,
//       CreatedByName: "",
//       CreateByID: "",
//       CreatedTime: "",
//       LastModified: "",
//       LastModifedBy: null,
//       LastModifiedTime: null,
//     },
//     {
//       Code: 0,
//       DecisionTask: null,
//       Status: 5,
//       StatusName: "Ngưng thực hiện",
//       Reason: null,
//       ReasonName: "Lý do khác",
//       ReasonDescription: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Provident laudantium voluptate vero possimus, quis dolor, animi placeat ab, debitis odio nulla enim? Quia voluptate sapiente fugiat veniam voluptatem aperiam dolore.",
//       OrderBy: 2,
//       CreatedBy: null,
//       CreatedByName: "",
//       CreateByID: "",
//       CreatedTime: "2024-11-11",
//       LastModified: "",
//       LastModifedBy: null,
//       LastModifiedTime: null,
//     }],
//     ApprovedID: "NV0002",
//     ApprovedName: "Nguyễn Văn Cảnh",
//     ApprovedPositionName: "Chủ tịch",
//     RecipientStaffName: "",
//     RecipientStaffID: "",
//     ListHRDecisionProfile: [],
//     NumOfStaff: 0,
//     NumOfBoarding: 0,
//     DecisionTypeName: "Onboarding",
//     TotalWorkingTask: 0,
//     TotalNotTask: 0,
//     TotalPauseTask: 0,
//     TotalDoneTask: 0,
//     TotalOverdueTask: 0,
//     TotalSentTask: 0,
//     StopDate: "2024-11-11",
//     ApprovedPositionID: "",
//     IsOverdue: false,
//     Approved: 0,
//     Recipient: 0,
//     RecipientPositionName: ""
//   },
//   {
//     Code: 2,
//     TaskName: "Công việc 2",
//     Description: "Bảng mô tả công việc sẽ bao gồm: tiêu đề công việc, mô tả chi tiết nội dung công việc, yêu cầu kỹ năng, trình độ học vấn",
//     AssigneeBy: "Frontend developer",
//     PositionApprovedName: "Chủ tịch",
//     OrderBy: 1,
//     DateDuration: 5,
//     PositionAssignee: 7,
//     TypeAssignee: 1,
//     PositionApproved: 3,
//     IsLeaderMonitor: false,
//     StartDate: "2024-10-20",
//     EndDate: "2024-11-16",
//     Status: 0,
//     DecisionProfile: 0,
//     Petition: 0,
//     Task: 0,
//     Remark: "",
//     Assignee: 1,
//     AssigneeName: "Đỗ Quốc Thành",
//     TypeData: 0,
//     TypeDataName: "",
//     AssigneeID: "NV0001",
//     AssigneePositionName: "Giám đốc",
//     ListHRDecisionTaskLog: [{
//       Code: 0,
//       DecisionTask: null,
//       Status: 3,
//       StatusName: "Đang thực hiện",
//       Reason: null,
//       ReasonName: "",
//       ReasonDescription: "",
//       OrderBy: 1,
//       CreatedBy: null,
//       CreatedByName: "",
//       CreateByID: "",
//       CreatedTime: "",
//       LastModified: "",
//       LastModifedBy: null,
//       LastModifiedTime: null,
//     }],
//     ApprovedID: "NV0002",
//     ApprovedName: "Nguyễn Văn Cảnh",
//     ApprovedPositionName: "Chủ tịch",
//     RecipientStaffName: "",
//     RecipientStaffID: "",
//     ListHRDecisionProfile: [],
//     NumOfStaff: 0,
//     NumOfBoarding: 0,
//     DecisionTypeName: "Onboarding",
//     TotalWorkingTask: 0,
//     TotalNotTask: 0,
//     TotalPauseTask: 0,
//     TotalDoneTask: 0,
//     TotalOverdueTask: 0,
//     TotalSentTask: 0,
//     StopDate: "2024-11-11",
//     ApprovedPositionID: "",
//     IsOverdue: false,
//     Approved: 0,
//     Recipient: 0,
//     RecipientPositionName: ""
//   }
// ]
