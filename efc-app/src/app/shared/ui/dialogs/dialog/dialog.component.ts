import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css',
})
export class DialogComponent implements OnInit {
  constructor(public translate: TranslateService) {}

  @Input()
  tabName!: string;

  @Input() contentTemplate!: TemplateRef<any>;

  @Input()
  dialogTitle!: string;

  @Input()
  dialogList!: string;

  @Input()
  dialogFirstMessage!: string;

  @Input()
  dialogSecondMessage!: string;

  @Output() closeDialogAction = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  accessItems: { key: string; value: string }[] = [];

  ngOnInit(): void {}
  onClose() {
    this.closeDialogAction.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
