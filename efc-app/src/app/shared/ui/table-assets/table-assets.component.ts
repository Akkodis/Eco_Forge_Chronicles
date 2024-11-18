import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Asset } from '../../models/assets-data';
import { FilterImagesService } from '../../services/filter-images.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-table-assets',
  templateUrl: './table-assets.component.html',
  styleUrl: './table-assets.component.css',
})
export class TableAssetsComponent {
  @ViewChild('tableBody') tableBody!: ElementRef<HTMLTableSectionElement>;

  @Output()
  assetSelectedAction = new EventEmitter<number>();

  @Input()
  headers: string[] = [];

  @Input()
  characterKeys: (keyof Asset)[] = [];

  @Input()
  characters: Asset[] = [];

  @Input()
  addEmptyRows!: boolean;

  @Input()
  width!: string;

  @Input()
  height!: string;

  @Input()
  listing!: boolean;

  @Input()
  waitingForConfirmation!: boolean;

  emptyRows: number[] = [];
  selectedAsset: Asset | null = null;
  overlayOffset = 0;


  constructor(
    private filterImagesService: FilterImagesService,
    private sanitizer: DomSanitizer
  ) {}

  ngAfterViewInit() {
    this.calculateEmptyRows();
  }

  onTableScroll() {
    this.overlayOffset = this.tableBody.nativeElement.scrollTop;
  }

  calculateEmptyRows() {
    const rowHeight = 30;
    const tableHeight = this.tableBody.nativeElement.clientHeight;
    const availableHeight = tableHeight - this.characters.length * rowHeight;
    const emptyRowsCount = Math.floor(availableHeight / rowHeight);
    this.emptyRows = new Array(Math.max(0, emptyRowsCount)).fill(null);
  }

  getRarityStars(rarity: string | number | undefined): SafeHtml {
    const image = this.filterImagesService.getRarityStars(rarity);
    if (image) {
      return this.sanitizer.bypassSecurityTrustHtml(image);
    } else {
      return '';
    }
  }

  getElement(rarity: string | number | undefined) {
    const image = this.filterImagesService.getElement(rarity);
    if (image) {
      return this.sanitizer.bypassSecurityTrustHtml(image);
    } else {
      return '';
    }
  }

  onAssetSelected($index: number) {
    this.assetSelectedAction.emit($index);
    const asset = this.characters[$index];
    if (this.selectedAsset === asset) {
      this.selectedAsset = null;
    } else {
      this.selectedAsset = asset;
    }
  }

  deleteRow(index: number) {
    this.characters.splice(index, 1);
    this.calculateEmptyRows()
  }
}
