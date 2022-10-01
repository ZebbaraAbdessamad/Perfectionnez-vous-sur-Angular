import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function confirmEqualValidator(main: string, confirm: string): ValidatorFn {
  //AbstractControl means : FormGroup Or FormControl
    return (ctrl: AbstractControl): null | ValidationErrors => {
        if (!ctrl.get(main) || !ctrl.get(confirm)) {
            return {
                confirmEqual: 'Invalid control names'
            };
        }
        const mainValue = ctrl.get(main)!.value;
        const confirmValue = ctrl.get(confirm)!.value;

        return mainValue === confirmValue ? null : {
          //confirmEqual est la clé qui nous avons utilisé pour has error
            confirmEqual: {
                main: mainValue,
                confirm: confirmValue
            }
        };
    };
}
