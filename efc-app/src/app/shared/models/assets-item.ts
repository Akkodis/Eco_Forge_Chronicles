export interface AssetItem {
  name: string;
  icon?: string;
  isExpanded?: boolean;
  children?: AssetItem[];
}
