import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent {
  menuVisible = false;
  showSettingsMenu = false;

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }

  toggleSettingsMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showSettingsMenu = !this.showSettingsMenu;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as Element).closest('.nav-item')) {
      this.showSettingsMenu = false;
    }
  }
}
