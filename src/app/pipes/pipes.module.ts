import { NgModule } from '@angular/core';
  
// Pipes
import { FormatPipe } from './format/format';
import { FirstErrorPipe } from './first-error.pipe'

@NgModule({
    declarations: [
        FormatPipe,
        FirstErrorPipe,
    ],
    imports: [],
    exports: [
        FormatPipe,
        FirstErrorPipe,
    ],
    providers: [
    ]
})
export class PipesModule { }