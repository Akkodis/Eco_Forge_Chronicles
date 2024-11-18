import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyListingsComponent } from './features/components/my-listings/my-listings.component';
import { SellComponent } from './features/components/sell/sell.component';

const routes: Routes = [
  {
    path: '',
    component: SellComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
