import { Component, OnDestroy, OnInit } from '@angular/core';
// import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
// import { LegendItemVisualArgs } from '@progress/kendo-angular-charts';
// import {  Element,  Circle as CircleShape,  geometry,  Group,  Path,  Rect as RectShape,  Text,} from "@progress/kendo-drawing";
// import { Ps_UtilObjectService } from 'src/app/p-lib';
// import { DTODashboard } from '../../shared/dto/DTODashboard';
// import { Subscription } from 'rxjs';
// import { DashboardAPIService } from '../../shared/services/dashboard-api.service';
// import { distinct, groupBy, GroupResult } from '@progress/kendo-data-query';
// import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
// import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
// import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
// const { Point, Rect, Size, Circle } = geometry;

@Component({
  selector: 'app-dashboard001-ecom',
  templateUrl: './dashboard001-ecom.component.html',
  styleUrls: ['./dashboard001-ecom.component.scss']
})
export class BI001DashboardEcomComponent implements OnInit, OnDestroy {
  // loading = false
  // justLoaded = true

  // year = 'Năm ' + new Date().getFullYear()
  // //style
  // font_nunito = 'Nunito, sans-serif '

  // fontSize_legend = '12px '
  // fontSize_content = '14px '
  // fontSize_axis = '16px '
  // fontSize_title = '20px '

  // color_gray = '#5c6873'

  // seriesColors = [
  //   '#470000',//đỏ 3p
  //   '#1a6634',//xanh 3p
  //   '#649e0f',//xanh hachi
  //   '#ffc000',
  //   '#5b9bd5',
  //   '#7030a0',
  //   '#255e91',
  //   '#9e480e',
  //   '#002060',
  //   this.color_gray
  // ]

  // public notesOptions = {
  //   position: 'left',
  //   icon: {
  //     visible: false,
  //   },
  //   label: {
  //     color: this.color_gray,
  //     content: (e) => e.dataItem.ChartTitle,
  //     font: this.fontSize_axis + this.font_nunito,
  //     margin: 0,
  //   },
  //   line: {
  //     width: 0,
  //   },
  // };
  // //data
  // data_column_orderStatus: DTODashboard = new DTODashboard(-1)
  // data_line_revenueByWeek: DTODashboard = new DTODashboard(-2)
  // data_bar_revenueByMonth: DTODashboard = new DTODashboard(-3)
  // data_columnLine_revenueByYear: DTODashboard = new DTODashboard(-4)
  // data_pie_revenueByChannel: DTODashboard = new DTODashboard(-5)
  // data_pie_orderByChannel: DTODashboard = new DTODashboard(-6)
  // data_column_revenueByWeek: DTODashboard = new DTODashboard(-7)

  // chartList: DTODashboard[] = [
  //   this.data_column_orderStatus,
  //   this.data_line_revenueByWeek,
  //   this.data_bar_revenueByMonth,
  //   this.data_columnLine_revenueByYear,
  //   this.data_pie_revenueByChannel,
  //   this.data_pie_orderByChannel,
  //   this.data_column_revenueByWeek,
  // ]
  // //category
  // dayOfWeek = [
  //   'Thứ 2',
  //   'Thứ 3',
  //   'Thứ 4',
  //   'Thứ 5',
  //   'Thứ 6',
  //   'Thứ 7',
  //   'Chủ Nhật'
  // ]

  // monthOfYear = [
  //   'Tháng 1',
  //   'Tháng 2',
  //   'Tháng 3',
  //   'Tháng 4',
  //   'Tháng 5',
  //   'Tháng 6',
  //   'Tháng 7',
  //   'Tháng 8',
  //   'Tháng 9',
  //   'Tháng 10',
  //   'Tháng 11',
  //   'Tháng 12',
  // ]

  // category_revevueByMonth = (
  //   groupBy(this.data_bar_revenueByMonth.ListData, [{ field: 'ChartTitle' }]) as GroupResult[]
  // ).map((e) => e.value);
  // //subscribe
  // arrSub: Subscription[] = []
  // //perm
  // dataPerm: DTODataPermission[] = []

  // constructor(
  //   public layoutService: LayoutService,
  //   public apiService: DashboardAPIService,
  //   public menuService: PS_HelperMenuService,
  // ) { }

  ngOnInit(): void {}
  //   let that = this
    
  //   var sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
  //     if (Ps_UtilObjectService.hasValue(res) && that.justLoaded) {
  //       that.dataPerm = distinct(res.DataPermission, "Warehouse")

  //       // that.getData()//tạm bỏ phân quyền
  //       this.getData2()
  //       that.justLoaded = false
  //     }
  //   })

  //   this.arrSub.push(sst)
  //   // this.getData2()//tạm bỏ phân quyền
  // }

  ngOnDestroy(): void {}
  //   this.arrSub.forEach(s => {
  //     s?.unsubscribe();
  //   });
  // }
  // //load
  // getData() {
  //   this.dataPerm.forEach(s => {
  //     let chartI = this.chartList.findIndex(f => f.ChartType == s.Warehouse)//tạm bỏ phân quyền

  //     if (chartI > -1) {
  //       this.GetDashboardIndex(null, chartI)
  //     }
  //   })
  // }
  // getData2() {
  //   this.chartList.forEach((s, i) => {
  //     this.GetDashboardIndex(null, i)
  //   })
  // }
  // //api 
  // GetDashboardIndex(chartVar: string, index: number) {
  //   this.loading = true;
  //   var ctx = 'Lấy dữ liệu dashboard'

  //   let sst = this.apiService.GetDashboardIndex(chartVar ? this[chartVar] : this.chartList[index]).subscribe(res => {
  //     if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
  //       chartVar ? this[chartVar] : this.chartList[index] = { ...res.ObjectReturn }

  //       if (this.chartList[index].ChartType == this.data_column_revenueByWeek.ChartType)
  //         this.data_column_revenueByWeek = { ...this.chartList[index] }
  //     } else
  //       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

  //     this.loading = false;
  //   }, () => {
  //     this.loading = false;
  //     this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
  //   });

  //   this.arrSub.push(sst)
  // }
  // //chart interface args
  // makeColor(colorNum, colors) {
  //   if (colors < 1) colors = 1;
  //   // defaults to one color - avoid divide by zero
  //   return colorNum * (360 / colors) % 360;
  // }

  // // getColor(index, total = this.data.length) {
  // //   return "hsl(" + this.makeColor(index, total) + ", 100%, 50% )"
  // // }

  // getValue(arr: []) {
  //   return arr.map((s: any) => { return s.value })
  // }

  // labelsVisual(args: LegendItemVisualArgs): Element {
  //   // if (args.series.name === "2019") {
  //   if (args.series.type == 'line') {
  //     // Create the lines used to represent the custom legend item
  //     const pathColor = args.options.markers.border.color;

  //     const cirOptions = {
  //       stroke: { width: 2, color: pathColor },
  //       fill: { color: "#fff" },
  //     };
  //     const cirGeometry = new Circle([12, 7], 3);
  //     const circle: CircleShape = new CircleShape(cirGeometry, cirOptions);

  //     const path1 = new Path({
  //       stroke: {
  //         color: pathColor,
  //         width: 3,
  //       },
  //     });

  //     const path2 = new Path({
  //       stroke: {
  //         color: pathColor,
  //         width: 3,
  //       },
  //     });

  //     // Create the text associated with the legend item
  //     const labelText = args.series.name;
  //     const labelFont = args.options.labels.font;
  //     const fontColor = args.options.labels.color;
  //     const textOptions = { font: labelFont, fill: { color: fontColor } };
  //     const text = new Text(labelText, new Point(30, 0), textOptions);

  //     // The paths are constructed by using a chain of commands
  //     path1.moveTo(0, 7).lineTo(10, 7).close();
  //     path2.moveTo(14, 7).lineTo(24, 7).close();

  //     // Place all the shapes in a group
  //     const group = new Group();

  //     // group.append(rect, path1, path2, text);
  //     // group.append(rect, path1, text);
  //     group.append(path1, circle, path2, text);

  //     // set opacity if the legend item is disabled
  //     if (!args.active) {
  //       group.opacity(0.5);
  //     }

  //     return group;
  //   }
  //   else if (args.series.type == 'column') {
  //     // Create the lines used to represent the custom legend item
  //     const pathColor = args.options.markers.border.color;
  //     // Create rectangular shape on top of which the label will be drawn
  //     const rectOptions = {
  //       stroke: { width: 1, color: pathColor },
  //       fill: { color: pathColor },
  //     };
  //     const rectGeometry = new Rect(new Point(0, 3), new Size(30, 10));
  //     const rect: RectShape = new RectShape(rectGeometry, rectOptions);

  //     // Create the text associated with the legend item
  //     const labelText = args.series.name;
  //     const labelFont = args.options.labels.font;
  //     const fontColor = args.options.labels.color;
  //     const textOptions = { font: labelFont, fill: { color: fontColor } };
  //     const text = new Text(labelText, new Point(35, 0), textOptions);

  //     // Place all the shapes in a group
  //     const group = new Group();
  //     group.append(rect, text);

  //     // set opacity if the legend item is disabled
  //     if (!args.active) {
  //       group.opacity(0.5);
  //     }

  //     return group;
  //   }
  //   // return the default visualization of the legend items
  //   return args.createVisual();
  // }

  // getTitle(e: string): string {
  //   var arr = e.split(' ')
  //   arr[arr.length - 4] += '\n'

  //   return arr.join(' ')
  // }

  // labelContent(e: any): string {
  //   var label = e.category + ': ' + e.dataItem.Percentage.toFixed(0).toLocaleString() + '%';
  //   var arr = Ps_UtilObjectService.replaceAll(label, '/', '/ ').split(' ')

  //   arr = arr.map((s, i) => {
  //     if (i > 0 && i % 3 <= 1)
  //       s = s + ' \n'
  //     return s
  //   })

  //   var rs = arr.join(' ')
  //   return rs
  // }

  // public labelContent2(e: any): string {
  //   var label = e.category + ': ' + e.value.toLocaleString() + ': ' + e.dataItem.Percentage.toFixed(0).toLocaleString() + '%';
  //   var arr = Ps_UtilObjectService.replaceAll(label, '/', '/ ').split(' ')

  //   arr = arr.map((s, i) => {
  //     if (i > 0 && i % 3 <= 1)
  //       s = s + ' \n'
  //     return s
  //   })

  //   var rs = arr.join(' ')
  //   return rs
  // }
}
