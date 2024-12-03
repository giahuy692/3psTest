import { Component, OnInit,Input,Output,EventEmitter,} from '@angular/core';
/**
 * @typedef {'Confirm' | 'Update' | 'Display'} string - Loại của Dialog.
 */
/**
 * Component Dialog dùng thư viện Kendo UI.
 *
 * @remarks
 * Đây là một Component dùng để tạo các Dialog dạng confirm, update hoặc chỉ xem thông tin.
 *
 * @example
 * <app-p-kendo-dialog></app-p-kendo-dialog>
 *
 * @export
 * @class PKendoDialogComponent
 * @implements {OnInit}
 */

@Component({
  selector: 'app-p-kendo-dialog',
  templateUrl: './p-kendo-dialog.component.html',
  styleUrls: ['./p-kendo-dialog.component.scss']
})
export class PKendoDialogComponent implements OnInit{

  // option img
  @Input() hasImageTitle: boolean = false
  @Input() srcImageTitle: string = ''
  /**
   * Tiêu đề biểu tượng trong Dialog.
   *
   * @type {string}
   */
  @Input() iconTitle: string = '';

  /**
   * Biểu tượng nút trong Dialog.
   *
   * @type {string}
   */
  @Input() iconButton: string = '';

  /**
   * Văn bản xác nhận nút trong Dialog.
   *
   * @type {string}
   */
  @Input() actionText: string = 'CÓ'

  /**
   * Văn bản hủy bỏ nút trong Dialog.
   *
   * @type {string}
   */
  @Input() cancelText: string = 'KHÔNG'

  /**
   * Tiêu đề của Dialog.
   *
   * @type {string}
   */
  @Input({ required: true }) title!: string;
  

  /**
   * Độ rộng của Dialog.
   *
   * @type {number}
   */
  @Input() width: number = 500;


  /**
   * Loại của Dialog ('Confirm' | 'Update' | 'Display'). Khi sử dụng hãy gọi EnumDialogType Để lấy type dialog.
   *
   * @type {number}
   */
  @Input() dialogType: number = 2;

  /**
   * Lớp CSS được sử dụng cho Dialog.
   *
   * @type {string}
   */
  dialogClass: string = '';

   // Các thuộc tính màu sắc để tùy chỉnh
   @Input() dialogColor: string = ''; // màu mặc định cho item

  /**
   * Sự kiện khi đóng Dialog.
   *
   * @type {EventEmitter<string>}
   */
  @Output() close: EventEmitter<string> = new EventEmitter<string>();

  /**
   * Sự kiện khi nhấn nút trong Dialog.
   *
   * @type {EventEmitter<string>}
   */
  @Output() handleButton: EventEmitter<string> = new EventEmitter<string>();
 
  constructor() { }

  /**
   * Hàm khởi tạo của Component.
   */
  ngOnInit(): void {
    this.updateDialogClass();  
  }

  
  /**
   * Hàm được gọi khi có thay đổi thuộc tính đầu vào của Component.
  */
 ngOnChanges() {
   this.updateDialogClass();
  }
  
  //Check giá trị mặc định cho dialog Display để ẩn nếu không truyền button
  isDialogType3WithDefaultValues(): boolean {
    return this.dialogType === 3 && this.actionText === 'CÓ' && this.cancelText === 'KHÔNG'; //true
  }
  /**
   * Cập nhật lớp CSS dựa trên dialogType.
   */
  updateDialogClass() {
    switch (this.dialogType) {
      case 1:
        this.dialogClass = 'confirm dialog';
        break;
      case 2:
        this.dialogClass = 'update dialog';
        break;
      case 3:
        this.dialogClass = 'display dialog';
        break;
      default:
        this.dialogClass = '';
        break;
    }
  }

  /**
   * Đóng Dialog.
   */
  closeDialog() {
    this.close.emit();
  }

  /**
   * Xử lý sự kiện khi nhấn nút trong Dialog.
   */
  onButtonClick() {
    this.handleButton.emit();
  }
}
