import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'decimals',
})
export class DecimalsPipe implements PipeTransform {
    transform(quantity: number, decimals: number) {
        return (quantity / Math.pow(10, decimals))
    }
}
