import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'username'
})
export class UsernamePipe implements PipeTransform {

  transform(value: {firstName:string ,lastName:string}, locale: 'en' | 'fr' = 'fr'): string {
    return locale === 'fr' ? `${value.lastName.toUpperCase()} ${value.firstName}` : `${value.firstName} ${value.lastName}`;
  }

}
