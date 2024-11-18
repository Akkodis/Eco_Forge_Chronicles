import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { filterAttributes } from '../../config/application.config';
import { Filters } from '../../models/filters';
import { Asset } from '../../models/assets-data';

@Component({
  selector: 'app-core-filter',
  templateUrl: './core-filter.component.html',
  styleUrl: './core-filter.component.css',
})
export class CoreFilterComponent implements OnInit, OnChanges {
  @Output()
  collapseAction = new EventEmitter<boolean>();

  @Input()
  selectedAsset: Asset | null = null;

  @Input()
  coreFilterCollapse!: boolean;

  collapsedFilter!: boolean;
  stars: string[] = [];
  rarity: string[] = [];
  element: string[] = [];
  profession: string[] = [];
  race: string[] = [];
  professions = [
    'Summoner',
    'Warrior',
    'Herbalist',
    'Analyst',
    'Supporter',
    'Informer',
    'Guardian',
    'Wizard',
    'Linker',
  ];
  races = [
    'Minclaw',
    'Necro',
    'Terral',
    'Askara',
    'Vitas',
    'Dragni',
    'Eluni',
    'Sirens',
    'Darki',
    'Thread',
    'Voltra',
  ];

  selectedProfession = '';
  selectedRace = '';
  isExpanded!: boolean;
  isExpandedRace!: boolean;
  filterExpanded!: boolean;

  attributes = [
    { name: 'Age', value: 298, min: 0, max: 425 },
    { name: 'Health', value: 1248, min: 0, max: 1455 },
    { name: 'Defense', value: 300, min: 0, max: 625 },
    { name: 'Attack', value: 422, min: 0, max: 866 },
  ];

  filters: Filters = {
    stars: [
      filterAttributes.STARS.ONE_STAR_INACTIVE,
      filterAttributes.STARS.TWO_STAR_INACTIVE,
      filterAttributes.STARS.THREE_STAR_INACTIVE,
      filterAttributes.STARS.FOUR_STAR_INACTIVE,
      filterAttributes.STARS.FIVE_STAR_INACTIVE,
    ],
    rarity: [
      filterAttributes.RARITY.COMMON,
      filterAttributes.RARITY.UNCOMMON,
      filterAttributes.RARITY.RARE,
      filterAttributes.RARITY.EPIC,
      filterAttributes.RARITY.LEGENDARY,
      filterAttributes.RARITY.MYTHIC,
      filterAttributes.RARITY.COMMON,
    ],
    element: [
      filterAttributes.ELEMENTS.FIRE,
      filterAttributes.ELEMENTS.NATURE,
      filterAttributes.ELEMENTS.HOLY,
      filterAttributes.ELEMENTS.DARK,
      filterAttributes.ELEMENTS.SPIRIT,
      filterAttributes.ELEMENTS.NEUTRAL,
      filterAttributes.ELEMENTS.ICE,
    ],
  };

  assetSelected!: boolean;
  assetCollapsed!: boolean;

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedAsset']) {
      this.filterExpanded = false;
    }

    // if (changes['coreFilterCollapse']) {
    //   this.collapsedFilter = this.coreFilterCollapse
    // }
  }

  onCollapseFilter() {
    this.collapseAction.emit(true);
    this.coreFilterCollapse = !this.coreFilterCollapse;
  }

  onCollapaseAssetSelected() {
    if (this.collapsedFilter) {
      this.collapsedFilter = false;
    }
    this.assetCollapsed = !this.assetCollapsed;
  }

  toggleFilter(index: number, filter: keyof Filters) {
    if (this.filters[filter][index].includes('Inactive')) {
      this.filters[filter][index] = this.filters[filter][index].replace(
        'Inactive',
        'Active'
      );
    } else {
      this.filters[filter][index] = this.filters[filter][index].replace(
        'Active',
        'Inactive'
      );
    }
  }

  onFilterExpanded() {
    this.filterExpanded = !this.filterExpanded;
  }
}
