import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatPipe } from './format.pipe';
import { DecimalsPipe } from './decimals.pipe';



@NgModule({
  declarations: [FormatPipe, DecimalsPipe],
  imports: [
    CommonModule
  ],
  exports: [
    FormatPipe,
    DecimalsPipe
  ]
})
export class PipesModule { }
