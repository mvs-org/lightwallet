import { NgModule } from '@angular/core';

// Pipes
import { FormatPipe } from './format/format'
import { OrderByPipe } from './order-by/order-by'

@NgModule({
    declarations: [
        FormatPipe,
        OrderByPipe
    ],
    imports: [ ],
    exports: [
        FormatPipe,
        OrderByPipe
    ]
})
export class PipesModule {}
