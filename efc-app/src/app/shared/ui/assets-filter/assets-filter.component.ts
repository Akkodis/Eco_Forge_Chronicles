import { Component, EventEmitter, Output } from '@angular/core';
import { AssetItem } from '../../models/assets-item';

@Component({
  selector: 'app-assets-filter',
  templateUrl: './assets-filter.component.html',
  styleUrl: './assets-filter.component.css',
})
export class AssetsFilterComponent {
  @Output()
  collapseAction = new EventEmitter<boolean>();

  selectedFilter: AssetItem | null = null;
  collapsedFilter!: boolean;
  assetItems: AssetItem[] = [
    {
      name: 'Cards',
      icon: 'path_to_cards_icon.png',
      isExpanded: false,
      children: [
        {
          name: 'Ur-Essence',
          isExpanded: false,
        },
        {
          name: 'Base Materials',
          isExpanded: false,
          children: [
            { name: 'Profession' },
            { name: 'Race' },
            { name: 'Element' },
          ],
        },
        {
          name: 'Materials',
          isExpanded: false,
        },
      ],
    },
    {
      name: 'Materials',
      icon: 'path_to_materials_icon.png',
      isExpanded: false,
      children: [
        {
          name: 'Ur-Essence',
          isExpanded: false,
        },
        {
          name: 'Base Materials',
          isExpanded: false,
          children: [
            { name: 'Profession' },
            { name: 'Race' },
            { name: 'Element' },
          ],
        },
        {
          name: 'Materials',
          isExpanded: false,
        },
      ],
    },
    {
      name: 'Building Instructions',
      icon: 'path_to_building_instructions_icon.png',
      isExpanded: false,
      children: [
        {
          name: 'Ur-Essence',
          isExpanded: false,
        },
        {
          name: 'Base Materials',
          isExpanded: false,
          children: [
            { name: 'Profession' },
            { name: 'Race' },
            { name: 'Element' },
          ],
        },
        {
          name: 'Materials',
          isExpanded: false,
        },
      ],
    },
  ];

  toggleExpand(item: any): void {
    if (item.children) {
      item.isExpanded = !item.isExpanded;
    }
  }

  onCollapseFilter() {
    this.collapseAction.emit(true);
    this.collapsedFilter = !this.collapsedFilter;
  }
}
