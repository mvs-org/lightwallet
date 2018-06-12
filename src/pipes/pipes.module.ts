import { NgModule } from '@angular/core';

// Pipes
import { FormatPipe } from './format/format'

@NgModule({
    declarations: [
        FormatPipe
    ],
    imports: [ ],
    exports: [
        FormatPipe
    ]
})
export class PipesModule {}
