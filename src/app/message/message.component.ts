import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {
  message: string = '';
  icon: string = 'fa-info-circle'; // default icon
  iconColor: string = '#666'; // default color
  title: string = '';
  isVisible: boolean = false;
  private timeoutId: any;
  @Output() closed = new EventEmitter<void>();

  show(message: string, icon: string, iconColor: string, title: string) {
    this.message = message;
    this.icon = icon;
    this.iconColor = iconColor;
    this.title = title;
    this.isVisible = true;
    this.timeoutId = setTimeout(() => this.closeModal(), 6000);
  }

  closeModal() {
    clearTimeout(this.timeoutId);
    this.isVisible = false;
    this.closed.emit();
  }
}
