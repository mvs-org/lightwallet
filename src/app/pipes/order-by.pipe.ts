import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'orderBy',
})

export class OrderByPipe implements PipeTransform {
    transform(array: Array<any>, args: Array<any>): Array<any> {
        const param = args[0]
        const direction = args[1]
        array.sort((a: any, b: any) => {
            if (a[param] < b[param]) {
                return direction === 1 ? 1 : -1
            } else if (a[param] > b[param]) {
                return direction === 1 ? -1 : 1
            } else {
                return 0;
            }
        });
        return array;
    }
}