import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {
  @Input() message: string = '';
  isVisible: boolean = false;

  show(message: string) {
    this.message = message;
    this.isVisible = true;
    setTimeout(() => this.isVisible = false, 3000);
  }
}
