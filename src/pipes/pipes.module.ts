import { NgModule } from '@angular/core';

// Pipes
import { FormatPipe } from './format/format'
import { OrderByPipe } from './order-by/order-by'
import { DecimalsPipe } from './decimals/decimals'

@NgModule({
    declarations: [
        FormatPipe,
        OrderByPipe,
        DecimalsPipe,
    ],
    imports: [ ],
    exports: [
        FormatPipe,
        OrderByPipe,
        DecimalsPipe,
    ]
})
export class PipesModule {}
