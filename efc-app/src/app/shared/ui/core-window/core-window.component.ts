import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { filterAttributes } from '../../config/application.config';
import { Asset } from '../../models/assets-data';
import { FilterImagesService } from '../../services/filter-images.service';
@Component({
  selector: 'app-core-window',
  templateUrl: './core-window.component.html',
  styleUrl: './core-window.component.css',
})
export class CoreWindowComponent implements OnInit {
  @ViewChild('tableBody') tableBody!: ElementRef;
  @HostListener('window:resize')
  headers = [
    'Asset',
    'Amount',
    'Rarity',
    'Age',
    'Element',
    'Profession',
    'Race',
    'Type',
    'Job',
    'Attack',
    'Defense',
    'Health',
  ];
  characterKeys: (keyof Asset)[] = [
    'asset',
    'amount',
    'rarity',
    'age',
    'element',
    'profession',
    'race',
    'type',
    'job',
    'attack',
    'defense',
    'health',
  ];
  characters: Asset[] = [
    {
      asset: 'Mynod',
      amount: 42,
      rarity: 1,
      age: 2216,
      element: 'nature',
      profession: 'Wizard',
      race: 'Elveri',
      type: 'Gaming Card',
      job: '-',
      attack: 375,
      defense: 544,
      health: 440,
    },
    {
      asset: 'Figment',
      amount: 187,
      rarity: 2,
      age: 0,
      element: 'dark',
      profession: '-',
      race: 'Beast Material',
      type: '-',
      job: '-',
      attack: 0,
      defense: 0,
      health: 0,
    },
    {
      asset: 'Oben',
      amount: 1,
      rarity: 3,
      age: 4554,
      element: 'spirit',
      profession: 'Warrior',
      race: 'Askora',
      type: 'Hero Card',
      job: '-',
      attack: 845,
      defense: 800,
      health: 1500,
    },
    {
      asset: 'Frostbristle',
      amount: 30,
      rarity: 4,
      age: 0,
      element: 'fire',
      profession: '-',
      race: 'Beast Material',
      type: '-',
      job: '-',
      attack: 0,
      defense: 0,
      health: 0,
    },
    {
      asset: 'Crystallized Amber',
      amount: 30,
      rarity: 5,
      age: 0,
      element: 'ice',
      profession: '-',
      race: 'Beast Material',
      type: '-',
      job: '-',
      attack: 0,
      defense: 0,
      health: 0,
    },
  ];

  emptyRows: number[] = [];
  coreFilterCollapse!: boolean;
  assetsFilterCollapse!: boolean;
  activeFilters: string[] = [];
  selectedAsset: Asset | null = null;

  constructor(private filterImagesService: FilterImagesService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.calculateEmptyRows();
  }

  calculateEmptyRows() {
    const rowHeight = 30;
    const tableHeight = this.tableBody.nativeElement.clientHeight;
    const availableHeight = tableHeight - this.characters.length * rowHeight;
    const emptyRowsCount = Math.floor(availableHeight / rowHeight);
    this.emptyRows = new Array(Math.max(0, emptyRowsCount)).fill(null);
  }

  onResize() {
    this.calculateEmptyRows();
  }

  getRarityStars(rarity: any) {
    return this.filterImagesService.getRarityStars(rarity);
  }

  getElement(rarity: any) {
    return this.filterImagesService.getElement(rarity);
  }

  onCollapseCoreFilter() {
    this.coreFilterCollapse = !this.coreFilterCollapse;
  }

  onCollpaseAssetsFilter() {
    this.assetsFilterCollapse = !this.assetsFilterCollapse;
  }

  onAssetSelected($index: number) {
    const asset = this.characters[$index];
    if (this.selectedAsset === asset) {
      this.selectedAsset = null;
    } else {
      this.selectedAsset = asset;
      this.coreFilterCollapse = false;
    }
  }
}
