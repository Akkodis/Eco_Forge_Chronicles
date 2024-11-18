import { Injectable } from '@angular/core';
import { filterAttributes } from '../config/application.config';

@Injectable({
  providedIn: 'root',
})
export class FilterImagesService {
  constructor() {}

  getRarityStars(rarity: string | number | undefined) {
    let numerOfStars;
    switch (rarity) {
      case 1:
        numerOfStars = `<img src=${filterAttributes.STARS.ONE_STAR_INACTIVE} class=h-6 w-6 />`;
        break;
      case 2:
        numerOfStars = `<img src=${filterAttributes.STARS.TWO_STAR_INACTIVE} class=h-6 w-6 />`;
        break;
      case 3:
        numerOfStars = `<img src=${filterAttributes.STARS.THREE_STAR_INACTIVE} class=h-6 w-6 />`;
        break;
      case 4:
        numerOfStars = `<img src=${filterAttributes.STARS.FOUR_STAR_INACTIVE} class=h-6 w-6 />`;
        break;
      case 5:
        numerOfStars = `<img src=${filterAttributes.STARS.FIVE_STAR_INACTIVE} class=h-6 w-6 />`;
        break;
      default:
    }
    return numerOfStars;
  }

  getElement(rarity: string | number | undefined) {
    let numerOfStars;
    switch (rarity) {
      case 'fire':
        numerOfStars = `<img src=${filterAttributes.ELEMENTS.FIRE} class=h-6 w-6 />`;
        break;
      case 'ice':
        numerOfStars = `<img src=${filterAttributes.ELEMENTS.ICE} class=h-6 w-6 />`;
        break;
      case 'spirit':
        numerOfStars = `<img src=${filterAttributes.ELEMENTS.SPIRIT} class=h-6 w-6 />`;
        break;
      case 'neutral':
        numerOfStars = `<img src=${filterAttributes.ELEMENTS.NEUTRAL} class=h-6 w-6 />`;
        break;
      case 'holy':
        numerOfStars = `<img src=${filterAttributes.ELEMENTS.HOLY} class=h-6 w-6 />`;
        break;
      case 'dark':
        numerOfStars = `<img src=${filterAttributes.ELEMENTS.DARK} class=h-6 w-6 />`;
        break;
      case 'nature':
        numerOfStars = `<img src=${filterAttributes.ELEMENTS.NATURE} class=h-6 w-6 />`;
        break;
      default:
    }
    return numerOfStars;
  }
}
