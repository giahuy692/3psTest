import { Component, Input } from '@angular/core';

@Component({
  selector: 'p-loading-spinner',
  templateUrl: './p-loading-spinner.component.html',
  styleUrls: ['./p-loading-spinner.component.scss']
})
export class PLoadingSpinnerComponent {
  @Input() isLoading: boolean = false;
}
