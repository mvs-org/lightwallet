import { Pipe, PipeTransform } from '@angular/core';
import { FormControl } from '@angular/forms';

@Pipe({
  name: 'firstError',
  pure: false,
})
export class FirstErrorPipe implements PipeTransform {

  transform(formControl: FormControl, args?: any): string {
    return formControl.errors ? Object.keys(formControl.errors)[0] : undefined;
  }

}
