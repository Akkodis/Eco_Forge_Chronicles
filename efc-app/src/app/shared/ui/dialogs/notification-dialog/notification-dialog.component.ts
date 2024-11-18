import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-notification-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrl: './notification-dialog.component.css',
})
export class NotificationDialogComponent extends DialogComponent {
  @Input() override dialogTitle = '';
  @Input() override dialogFirstMessage = '';
  @Input() override dialogSecondMessage = '';
  @Input() override accessItems: { key: string; value: string }[] = [];
  @Input() image!: string;
  @Output() onCloseDialog = new EventEmitter<void>();

  override ngOnInit() {
    this.loadAccessItems();
  }

  loadAccessItems() {
    this.translate.get(this.dialogList).subscribe((res: any) => {
      this.accessItems = Object.entries(res).map(([key, value]) => ({
        key,
        value: value as string,
      }));
    });
  }
  handleDialogClosed() {
    this.onCloseDialog.emit();
  }
}
