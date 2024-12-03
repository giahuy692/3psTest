import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PLayoutRoutingModule } from './p-layout-routing.module';
import { LayoutDefaultComponent } from './layout-default/layout-default.component';
import { LayoutPortalComponent } from './layout-portal/layout-portal.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { HeaderPortalComponent } from './components/header-portal/header-portal.component';
import { MenuPortalComponent } from './components/menu-portal/menu-portal.component';
import { MenuComponent } from './components/menu/menu.component';
import { ButtonModule, DropDownButtonModule, ListModule } from '@progress/kendo-angular-buttons';
import { IconsModule, ICON_SETTINGS } from '@progress/kendo-angular-icons';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DropDownsModule, DropDownListModule, DropDownTreesModule, MultiSelectModule } from '@progress/kendo-angular-dropdowns';
import { PopupModule } from '@progress/kendo-angular-popup';
import { ImportPopupComponent } from './components/import-popup/import-popup.component';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { FileSelectModule, UploadModule, UploadsModule } from '@progress/kendo-angular-upload';
import { GridModule, PagerModule } from '@progress/kendo-angular-grid';
import { PKendoGridColumnComponent } from './components/p-kendo-grid/p-kendo-grid-column.component';
import { PKendoGridComponent } from './components/p-kendo-grid/p-kendo-grid.component';
import { PKendoDialogComponent } from './components/p-kendo-dialog/p-kendo-dialog.component';
import { PFileButtonGroupComponent } from './components/p-file-button-group/p-file-button-group.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FolderPopupComponent } from './components/folder-popup/folder-popup.component';
import { TreeListModule } from '@progress/kendo-angular-treelist';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DeletePopupComponent } from './components/delete-popup/delete-popup.component';
import { PKendoGridDropdownlistComponent } from './components/p-kendo-grid-dropdownlist/p-kendo-grid-dropdownlist.component';
import { SelectedRowitemPopupComponent } from './components/selected-rowitem-popup/selected-rowitem-popup.component';
import { SearchProductPopupComponent } from './components/search-product-popup/search-product-popup.component';
import { PChangepasswordPopupComponent } from './components/p-changepassword-popup/p-changepassword-popup.component';
import { InputsModule, TextBoxModule } from '@progress/kendo-angular-inputs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PKendoEditorComponent } from './components/p-kendo-editor/p-kendo-editor.component';
import { EditorModule } from '@progress/kendo-angular-editor';
import { EmployeeAttendanceService, ProductSalesService } from './services/folder-popup.service';
import { CheckboxButtonGroupComponent } from './components/checkbox-button-group/checkbox-button-group.component';
import { SearchFilterGroupComponent } from './components/search-filter-group/search-filter-group.component';
import { FloatingLabelModule, LabelModule } from '@progress/kendo-angular-label';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { PKendoTextboxComponent } from './components/p-kendo-textbox/p-textbox.component';
import { PKendoTextareaComponent } from './components/p-kendo-textarea/p-textarea.component';
import { PKendoMaskedTextboxComponent } from './components/p-masked-textbox/p-masked-textbox.component';
import { PKendoNumericTextboxComponent } from './components/p-kendo-numeric-textbox/p-numeric-textbox.component';
import { PKendoBreadcrumbComponent } from './components/p-kendo-breadcrumb/p-kendo-breadcrumb.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ScrollViewModule } from '@progress/kendo-angular-scrollview';
import { ColorStatusPipe } from './pipe/color-status.pipe';
import { NotificationModule } from "@progress/kendo-angular-notification";
import { NavigationModule } from '@progress/kendo-angular-navigation';
import { PDatePickerComponent } from './components/p-datepicker/p-datepicker.component';
import { PDateTimePickerComponent } from './components/p-datetimepicker/p-datetimepicker.component';
import { PKendoTreelistComponent } from './components/p-kendo-treelist/p-kendo-treelist.component';
import { PKendoTreeListColumnComponent } from './components/p-kendo-treelist/p-kendo-treelist-column.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
// import { TooltipsModule } from '@progress/kendo-angular-tooltip';
import { ConvertStringEditorPipe } from './pipe/convert-edit-text.pipe';
import { ConvertMinuteToString } from './pipe/convert-minute.pipe';
import { PKendodropdownlistComponent } from './components/p-kendo-dropdownlist/p-kendo-dropdownlist.component';
import { PKendoDropdowntreeComponent } from './components/p-kendo-dropdowntree/p-kendo-dropdowntree.component';
import { IntegerPartPipe } from './pipe/integer-part-pipe.pipe';
import { PLoadingSpinnerComponent } from './components/p-loading-spinner/p-loading-spinner.component';
import { ConvertToDatePipe } from './pipe/convert-to-date.pipe';
import { PersonalInfoDetailComponent } from './components/personal-info-detail/personal-info-detail.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { environment } from "src/environments/environment";
import { getMessaging, MessagingModule, provideMessaging } from '@angular/fire/messaging';

@NgModule({
  declarations: [
    //component
    CheckboxButtonGroupComponent,
    DeletePopupComponent,
    FolderPopupComponent,
    FooterComponent,
    HeaderComponent,
    HeaderPortalComponent,
    ImportPopupComponent,
    LayoutDefaultComponent,
    LayoutPortalComponent,
    MenuComponent,
    MenuPortalComponent,
    PChangepasswordPopupComponent,
    PFileButtonGroupComponent,
    PKendoBreadcrumbComponent,
    PKendoDialogComponent,
    PKendoEditorComponent,
    PKendoGridColumnComponent,
    PKendoGridComponent,
    PKendoGridDropdownlistComponent,
    PKendoTextboxComponent,
    PKendoTextareaComponent,
    PKendoTreelistComponent,
    PKendoTreeListColumnComponent,
    PKendoMaskedTextboxComponent,
    PKendoNumericTextboxComponent,
    PKendoBreadcrumbComponent,
    SearchFilterGroupComponent,
    SearchProductPopupComponent,
    SelectedRowitemPopupComponent,
    PDatePickerComponent,
    PDateTimePickerComponent,
    PLoadingSpinnerComponent,
    //pipe
    ColorStatusPipe,
    ConvertStringEditorPipe,
    ConvertMinuteToString,
    PKendodropdownlistComponent,
    PKendoDropdowntreeComponent,
    IntegerPartPipe,
    ConvertToDatePipe,
    PersonalInfoDetailComponent,
  ],
  imports: [
    ButtonModule,
    ChartsModule,
    CommonModule,
    DateInputsModule,
    DialogsModule,
    DropDownButtonModule,
    DropDownListModule,
    DropDownTreesModule,
    DropDownsModule,
    EditorModule,
    FileSelectModule,
    FloatingLabelModule,
    FontAwesomeModule,
    FormsModule,
    GridModule,
    IconsModule,
    InputsModule,
    // IvyCarouselModule,
    LabelModule,
    LayoutModule,
    ListModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatSidenavModule,
    MatToolbarModule,
    MultiSelectModule,
    NotificationModule,
    PLayoutRoutingModule,
    PagerModule,
    PopupModule,
    ReactiveFormsModule,
    ScrollViewModule,
    TextBoxModule,
    // TooltipsModule,
    TreeListModule,
    TreeViewModule,
    NavigationModule,
    UploadModule,
    UploadsModule,
    MessagingModule
  ],
  providers: [
    // provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    // provideMessaging(() => getMessaging()),
    { provide: 'IGraphServices', useClass: EmployeeAttendanceService, multi: true },
    { provide: 'IGraphServices', useClass: ProductSalesService, multi: true },
    { provide: ICON_SETTINGS, useValue: { type: 'font' } },
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
  ],
  exports: [
    //component
    // PKendoGridColumnComponent,
    CheckboxButtonGroupComponent,
    FolderPopupComponent,
    ImportPopupComponent,
    PChangepasswordPopupComponent,
    PFileButtonGroupComponent,
    PKendoBreadcrumbComponent,
    PKendoDialogComponent,
    PKendoEditorComponent,
    PKendoGridComponent,
    PKendoGridDropdownlistComponent,
    PKendoTextboxComponent,
    PKendoTextareaComponent,
    PKendoTreelistComponent,
    PKendoTreeListColumnComponent,
    PKendoMaskedTextboxComponent,
    PKendoNumericTextboxComponent,
    SearchFilterGroupComponent,
    SearchProductPopupComponent,
    SelectedRowitemPopupComponent,
    PDatePickerComponent,
    PDateTimePickerComponent,
    PKendodropdownlistComponent,
    PKendoDropdowntreeComponent,
    PLoadingSpinnerComponent,
    PersonalInfoDetailComponent,
    //module
    ButtonModule,
    ChartsModule,
    CommonModule,
    DateInputsModule,
    DialogsModule,
    DropDownButtonModule,
    DropDownListModule,
    DropDownTreesModule,
    DropDownsModule,
    EditorModule,
    FileSelectModule,
    FloatingLabelModule,
    FontAwesomeModule,
    FormsModule,
    GridModule,
    IconsModule,
    InputsModule,
    NavigationModule,
    // IvyCarouselModule,
    LabelModule,
    LayoutModule,
    ListModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatSidenavModule,
    MatToolbarModule,
    NotificationModule,
    PagerModule,
    PopupModule,
    ReactiveFormsModule,
    ScrollViewModule,
    ScrollingModule,
    TextBoxModule,
    // TooltipsModule,
    TreeListModule,
    TreeViewModule,
    UploadModule,
    //pipe
    ColorStatusPipe,
    ConvertStringEditorPipe,
    ConvertMinuteToString,
    IntegerPartPipe,
    ConvertToDatePipe

  ]
})
export class PLayoutModule {}
