import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SpinnerService } from '../../services/utils/spinner-service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css',
})
export class SpinnerComponent {
  constructor(public spinnerService: SpinnerService) {}
}
