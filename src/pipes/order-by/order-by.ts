import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'orderBy',
})

export class OrderByPipe implements PipeTransform {
    transform(array: Array<string>, args: Array<any>): Array<string> {
        let param = args[0]
        let direction = args[1]
        array.sort((a: any, b: any) => {
            if (a[param] < b[param]) {
                return direction == 1 ? 1 : -1;
            } else if (a[param] > b[param]) {
                return direction == 1 ? -1 : 1;
            } else {
                return 0;
            }
        });
        return array;
    }
}
