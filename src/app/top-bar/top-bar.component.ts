import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent {
  @Output() toggle = new EventEmitter<void>();
  sidebarVisible = false;

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    this.toggle.emit();
  }

  closeSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    this.toggle.emit();
  }
}
