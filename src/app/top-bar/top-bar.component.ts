import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {
  menuVisible = false;

  ngOnInit() {
    // Initialize Flowbite components
    import('flowbite').then(({ initFlowbite }) => initFlowbite());
  }

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }
}
