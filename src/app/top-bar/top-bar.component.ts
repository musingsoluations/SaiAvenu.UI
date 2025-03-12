import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Dropdown } from 'flowbite';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit, AfterViewInit {
  menuVisible = false;
  hasAdminRole = false;

  constructor(private authService: AuthService) { }

  ngAfterViewInit() {
    const dropdownTriggerEl = document.getElementById('dropdownNavbar');
    if (!dropdownTriggerEl) {
      return;
    }
    var dropdownInstance = new Dropdown(dropdownTriggerEl);
    const submenuItems = document.querySelectorAll('#dropdownNavbar a');

    submenuItems?.forEach((item) => {
      item.addEventListener('click', () => {
        dropdownInstance?.hide();
      });
    });
  }

  ngOnInit() {
    // Initialize Flowbite components
    import('flowbite').then(({ initFlowbite }) => initFlowbite());

    this.authService.roles$.subscribe((roles: string[]) => {
      this.hasAdminRole = roles.includes('Admin');
    });
  }

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }
}
