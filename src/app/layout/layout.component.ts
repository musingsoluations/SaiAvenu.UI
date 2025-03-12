import { Component } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SpinnerService } from '../spinner.service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterModule, TopBarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  constructor(public spinnerService: SpinnerService) { }
}
