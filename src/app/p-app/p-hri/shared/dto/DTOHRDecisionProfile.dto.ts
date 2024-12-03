import { Ps_UtilObjectService } from "src/app/p-lib";
import { DTOHRDecisionTaskLog } from "./DTOHRDecisionTaskLog.dto";

// export class DTOHRDecisionProfile {
//     Code: number = 0 // Code 
//     Decision: number // Code quyết định
//     Staff: number = null; // Code nhân sự
//     PersonalProfile: number // Code hồ sơ
//     Department: number // Code đơn vị
//     Position: number // Code chức danh
//     Location: number // Code địa điểm
//     TypeStaff: number // Enum loại nhân sự
//     JoinDate: string = "" // Ngày vào làm
//     Reason: string = "" // Lí do 
//     Remark: string = "" // Ghi chú
//     Status: number = 1 // Trạng thái
//     ImageThumb: string // Ảnh đại diện
//     IdentityNo: string = "" // CMND/CCCD
//     FullName: string = "" // Họ và tên
//     PositionName: string = "" // Tên chức danh tuyển dụng, điều chuyển
//     GenderName: string = "" // Tên giới tính
//     BirthDate: string // Năm sinh
//     DepartmentName: string = "" // Tên đơn vị tuyển dụng, điều chuyển
//     LocationName: string = "" // Tên địa điểm tuyển dụng, điều chuyển
//     TypeStaffName: string = "" // Tên loại nhân sự
//     Cellphone: string = "" // SĐT
//     Email: string = "" // Email
//     CurrentDepartmentName: string = "" // Tên đơn vị hiện tại
//     CurrentLocationName: string = "" // Tên địa điểm hiện tại
//     CurrentPositionName: string = "" // Tên chức danh hiện tại
//     StaffID: string = "" // Mã nhân sự
//     StatusName: string = "" // Tên trạng thái
//     TypeProfile: number = null // Loại quá trình
//     TypeProfileName: string = "" // Tên loại quá trình
//     StartDate: string = null // Ngày bắt đầu quá trình
//     EndDate: string = null // Ngày kết thúc quá trình
//     StopDate: string = null // Ngày ngưng quá trình
//     ReasonStatus: string = "" // mã Lí do ngưng
//     ReasonStatusName: string = "" // Tên lí do ngưng
//     ReasonStatusDescription: string = "" // Mô tả lí do
//     DecisionType: number = null // Phân loại quyết định
//     DecisionTypeName: string = "" // Tên loại quyết định
//     TotalTask: number = 0 // Số lượng công việc
//     TotalUnTask: number = 0  // Số lượng công việc chưa thực hiện
//     TotalNotTask: number = 0  // Số lượng công việc không thực hiện
//     TotalWorkingTask: number = 0  // Số lượng công việc đang thực hiện
//     TotalDoneTask: number = 0  // Số lượng công việc hoàn tất
//     TotalPauseTask: number = 0  //Số lượng công việc ngưng thực hiện
//     TotalWorkingTaskToday: number = 0  // Số lượng công việc thực hiện hôm nay
//     TotalSentTask: number = 0  // Số lượng công việc đã gửi duyệt [ Chờ duyệt ]
//     TotalOverdueTask: number = 0  //Số lượng công việc quá hạn
//     EndDateEstimate: string = '' // Dự kiến kết thúc
//     DecisionID: string = '' // Mã quyết định
//     DecisionEffDate: string = '' // Thời gian hiệu lực quyết định
//     NumOfDate: number = 0  // Số ngày onboard / offboard
//     ListStatus: {DecisionType: number,Status: number, StatusName: string}[] = [] // Danh sách trạng thái
//     RemainingDate: number = null // Số ngày còn lại
//     AssigneeName: string = '' // Tên người làm
//     AssigneeID: string = '' // Mã người làm
//     AssigneePositionName: string = '' // Tên  chức danh người làm
//     ApproveID: string = '' // Mã người duyệt
//     ApproveName: string = '' // Tên người duyệt
//     ApprovePositionName: string = '' // Tên chức danh người duyệt
//     DueDate: string = '' // Trước ngày
//     SentDate: string = '' // Ngày gửi
//     DoneDate: string = '' // Ngày hoàn thành
//     PauseDate: string = '' // Ngày ngưng
//     ListStatusTask: DTOHRDecisionTaskLog[] // Danh sách trạng thái công việc
//     BoardingType: string = ''
// }

export class DTOHRDecisionProfile {
    constructor(dto?: Partial<DTOHRDecisionProfile>) {
        if (Ps_UtilObjectService.hasValue(dto)) {
            Object.assign(this, dto); // Sao chép giá trị từ dto vào instance
            this.ListOfAttached = JSON.parse(dto.ListOfAttached); // Parse JSON trực tiếp
        }
    }
    
    Code: number = 0 // Code 
    Decision: number = 0 // Code quyết định
    Staff: number = null; // Code nhân sự
    PersonalProfile: number = 0 // Code hồ sơ
    Department: number = null // Code đơn vị
    Position: number = null// Code chức danh
    Location: number = null // Code địa điểm
    TypeStaff: number = 0 // Enum loại nhân sự
    JoinDate: string = "" // Ngày vào làm
    Reason: string = "" // Lí do 
    Remark: string = "" // Ghi chú
    Status: number = 1 // Trạng thái
    ImageThumb: string // Ảnh đại diện
    IdentityNo: string = "" // CMND/CCCD
    FullName: string = "" // Họ và tên
    PositionName: string = "" // Tên chức danh tuyển dụng, điều chuyển
    GenderName: string = "" // Tên giới tính
    BirthDate: string // Năm sinh
    DepartmentName: string = "" // Tên đơn vị tuyển dụng, điều chuyển
    LocationName: string = "" // Tên địa điểm tuyển dụng, điều chuyển
    TypeStaffName: string = "" // Tên loại nhân sự
    Cellphone: string = "" // SĐT
    Email: string = "" // Email
    CurrentDepartmentName: string = "" // Tên đơn vị hiện tại
    CurrentLocationName: string = "" // Tên địa điểm hiện tại
    CurrentPositionName: string = "" // Tên chức danh hiện tại
    StaffID: string = "" // Mã nhân sự
    StatusName: string = "" // Tên trạng thái
    TypeProfile: number = null // Loại quá trình
    TypeProfileName: string = "" // Tên loại quá trình
    StartDate: string = null // Ngày bắt đầu quá trình
    EndDate: string = null // Ngày kết thúc quá trình
    ReasonStatus: number = null // mã Lí do ngưng
    ReasonStatusName: string = "" // Tên lí do ngưng
    ReasonStatusDescription: string = "" // Mô tả lí do
    BoardingType: number = 0; // Loại boarding
    BoardingTypeName: string = "" // Tên loại boarding
    DecisionType: number = null // Phân loại quyết định
    DecisionTypeName: string = "" // Tên loại quyết định
    TotalTask: number = 0 // Số lượng công việc
    TotalUnTask: number = 0  // Số lượng công việc chưa thực hiện
    TotalNotTask: number = 0  // Số lượng công việc không thực hiện
    TotalWorkingTask: number = 0  // Số lượng công việc đang thực hiện
    TotalDoneTask: number = 0  // Số lượng công việc hoàn tất
    TotalPauseTask: number = 0  //Số lượng công việc ngưng thực hiện
    TotalWorkingTaskToday: number = 0  // Số lượng công việc thực hiện hôm nay
    TotalSentTask: number = 0  // Số lượng công việc đã gửi duyệt [ Chờ duyệt ]
    TotalOverdueTask: number = 0  //Số lượng công việc quá hạn
    EndDateEstimate: string = '' // Dự kiến kết thúc
    DecisionID: string = '' // Mã quyết định
    DecisionEffDate: string = '' // Thời gian hiệu lực quyết định
    NumOfDate: number = 0  // Số ngày onboard / offboard
    ListStatus: {DecisionType: number,Status: number, StatusName: string}[] = [] // Danh sách trạng thái
    AssigneeName: string = '' // Tên người làm
    AssigneeID: string = '' // Mã người làm
    AssigneePositionName: string = '' // Tên  chức danh người làm
    ApproveID: string = '' // Mã người duyệt
    ApproveName: string = '' // Tên người duyệt
    ApprovePositionName: string = '' // Tên chức danh người duyệt
    DecisionProfileChild: DTOHRDecisionProfile[] // Danh sách hồ sơ nhân sự
    ListStatusTask: DTOHRDecisionTaskLog[]; // Danh sách trạng thái
    TypeStop: number = null; //Hướng xử lý khi ngưng điều chuyển
    ProbationPeriodDays: number = 60 // Số ngày thử việc

    //- Quyết định kỷ luật
    DisciplinaryForm: number = null; // Code hình thức xử lý hiện tại
    DisciplinaryFormName: string = '' // Tên hình thức xử lý hiện tại
    ListOfAttached: string = '' // JSON.Stringtify([]) Tài liệu đính kèm hiện tại
    TimeHandle: number = 0; // Thời gian kỷ luật
}