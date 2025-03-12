import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Dropdown } from 'flowbite';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit, AfterViewInit {
  menuVisible = false;

  ngAfterViewInit() {
    const dropdownTriggerEl = document.getElementById('dropdownNavbar');
    var dropdownInstance = new Dropdown(dropdownTriggerEl);
    const submenuItems = document.querySelectorAll('#dropdownNavbar a');

    submenuItems.forEach((item) => {
      item.addEventListener('click', () => {
        dropdownInstance.hide();
      });
    });
  }

  ngOnInit() {
    // Initialize Flowbite components
    import('flowbite').then(({ initFlowbite }) => initFlowbite());
  }

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }
}
