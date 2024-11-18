import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  @Input()
  label!: string;

  @Input()
  width!: string;

  @Input()
  height!: string;

  @Output()
  onButtonAction = new EventEmitter<boolean>();

  onButtonClick() {
    this.onButtonAction.emit(true);
  }
}
