import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatPipe } from './format.pipe';
import { DecimalsPipe } from './decimals.pipe';
import { OrderByPipe } from './order-by.pipe';



@NgModule({
  declarations: [FormatPipe, DecimalsPipe, OrderByPipe],
  imports: [
    CommonModule
  ],
  exports: [
    FormatPipe,
    DecimalsPipe,
    OrderByPipe,
  ]
})
export class PipesModule { }
