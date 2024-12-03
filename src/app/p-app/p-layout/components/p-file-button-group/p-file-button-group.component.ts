import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Ps_UtilObjectService } from 'src/app/p-lib';

class Icon {
  code: number
  text: string
  iconName: string
  title: string
}
/**
 * Component gồm các Button xuất file. Trong đó:
 * - Input listButton: bao gồm các enum button có thể hiển thị với: 1-Xuất template, 2-Print, 3-Excel, 4-PDF, 5-Word
 * - Input disable: Có disable toàn bộ hay không
 * - Output getTypeFile: Lấy button được click
 */
@Component({
  selector: 'app-p-file-button-group',
  templateUrl: './p-file-button-group.component.html',
  styleUrls: ['./p-file-button-group.component.scss']
})
export class PFileButtonGroupComponent implements OnInit {

  @Input() disable: boolean = false;
  @Input() listButton: number[] = [1, 2, 3, 4, 5];
  @Output() getTypeFile = new EventEmitter<Icon>();

  data: Icon[] = [
    {
      code: 1,
      text: "Export",
      iconName: "import",
      title: 'Export file'
    },
    {
      code: 2,
      text: "Print",
      iconName: "print.svg",
      title: 'Print'
    },
    {
      code: 3,
      text: "Excel",
      iconName: "xlsx.svg",
      title: 'Excel'
    },
    {
      code: 4,
      text: "PDF",
      iconName: 'pdf.svg',
      title: 'PDF'
    },
    {
      code: 5,
      text: "Word",
      iconName: 'docx.svg',
      title: 'Word'
    }
  ];

  filteredData: Icon[] = []; // Mảng mới để lưu trữ data sau khi lọc

  selectedButton: Icon = null;

  constructor() { }

  ngOnInit(): void {
    // Lọc data dựa trên listButton
    this.filteredData = this.data.filter(item => item.code > 2);

    // Khởi tạo giá trị mặc định nếu có phần tử sau khi lọc
    if (this.filteredData.length > 0) {
      this.selectedButton = this.filteredData[0];
    }
  }

  onItemClick(event: Icon, codeButton?: number) {
    if (Ps_UtilObjectService.hasValue(event) && event.code > 2) {
      this.selectedButton = event;

      if(codeButton !== -1){
        this.getTypeFile.emit(event);
      }
      return;
    }

    this.getTypeFile.emit(this.data.filter(item => item.code === codeButton)[0]);
  }
}
