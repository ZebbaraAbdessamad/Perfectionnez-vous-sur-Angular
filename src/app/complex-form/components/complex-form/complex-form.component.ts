import { ComplexFormService } from './../../services/complex-form.service';
import { Observable, map, startWith, tap } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { validValidator } from '../../validators/valid.validator';
import { confirmEqualValidator } from '../../validators/confirm-equal.validator';

@Component({
  selector: 'app-complex-form',
  templateUrl: './complex-form.component.html',
  styleUrls: ['./complex-form.component.scss']
})
export class ComplexFormComponent implements OnInit {


  //snipper status
  loading = false;
  // the main from Group
  mainForm!:FormGroup;
  //personal Info form
  personalInfoForm!: FormGroup;
  // others form controls
  contactPreferenceCtrl!: FormControl;
  phoneCtrl!: FormControl;

  //email form
  emailCtrl!: FormControl;
  confirmEmailCtrl!: FormControl;
  emailForm!: FormGroup;

  //loginInfo
  passwordCtrl!: FormControl;
  confirmPasswordCtrl!: FormControl;
  loginInfoForm!: FormGroup;

  //Observable of show interphace
  showEmailCtrl$!: Observable<boolean>;
  showPhoneCtrl$!: Observable<boolean>;

  //Observable of show errors
  showEmailError$!:Observable<boolean>;
  showPasswordError$!:Observable<boolean>;

  constructor(
    private formBuilder:FormBuilder,
    private ComplexFormService:ComplexFormService
  ) { }

  ngOnInit(): void {
    this.initFormControls();
    this.initMainForm();
    this.initFormObservables();
  }

  private initFormControls():void{
    //info
    this.personalInfoForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });

    //radioButton
        this.contactPreferenceCtrl = this.formBuilder.control('email');
    //email
    this.emailCtrl = this.formBuilder.control('');
    this.confirmEmailCtrl = this.formBuilder.control('');
    this.emailForm = this.formBuilder.group({
          email: this.emailCtrl,
          confirm: this.confirmEmailCtrl
      }, {
          validators: [confirmEqualValidator('email', 'confirm')],
          updateOn: 'blur',
    });
   //phone
    this.phoneCtrl = this.formBuilder.control('');

    //loginInfo
    this.passwordCtrl = this.formBuilder.control('', Validators.required);
    this.confirmPasswordCtrl = this.formBuilder.control('', Validators.required);
    this.loginInfoForm = this.formBuilder.group({
        username: ['', Validators.required],
        password: this.passwordCtrl,
        confirmPassword: this.confirmPasswordCtrl
    }, {
        validators: [confirmEqualValidator('password', 'confirmPassword')],
        updateOn: 'blur',
    });
  }

  //remarque : en mettre cette deux method private pour ne l'accedé pas dans de template Html
  private initMainForm(): void {
    this.mainForm = this.formBuilder.group({
        personalInfo: this.personalInfoForm,
        contactPreference: this.contactPreferenceCtrl,
        email: this.emailForm,
        phone: this.phoneCtrl,
        loginInfo: this.loginInfoForm
    });
  }

  //intiale observaible
  private initFormObservables() {
    this.showEmailCtrl$ = this.contactPreferenceCtrl.valueChanges.pipe(
      startWith(this.contactPreferenceCtrl.value),
        map(preference => preference === 'email'),
        tap(showEmailCtrl => this.setEmailValidators(showEmailCtrl))
    );
    this.showPhoneCtrl$ = this.contactPreferenceCtrl.valueChanges.pipe(
      startWith(this.contactPreferenceCtrl.value),
        map(preference => preference === 'phone'),
        tap(showPhoneCtrl => this.setPhoneValidators(showPhoneCtrl))
    );
    this.showEmailError$ = this.emailForm.statusChanges.pipe(
      map(status => status === 'INVALID' && this.emailCtrl.value &&  this.confirmEmailCtrl.value)
    );
    this.showPasswordError$ = this.loginInfoForm.statusChanges.pipe(
      map(status => status === 'INVALID' &&
                    this.passwordCtrl.value &&
                    this.confirmPasswordCtrl.value &&
                    this.loginInfoForm.hasError('confirmEqual')
      )
  );
  }
    private setEmailValidators(showEmailCtrl: boolean) {
      if (showEmailCtrl) {
          this.emailCtrl.addValidators([
              Validators.required,
              Validators.email
              , validValidator()
          ]);
          this.confirmEmailCtrl.addValidators([
              Validators.required,
              Validators.email
          ]);
      } else {
          this.emailCtrl.clearValidators();
          this.confirmEmailCtrl.clearValidators();
      }
      this.emailCtrl.updateValueAndValidity();
      this.confirmEmailCtrl.updateValueAndValidity();
    }

    private setPhoneValidators(showPhoneCtrl: boolean) {
        if (showPhoneCtrl) {
            this.phoneCtrl.addValidators([
                Validators.required,
                Validators.minLength(10),
                Validators.maxLength(10)
            ]);
        } else {
            this.phoneCtrl.clearValidators();
        }
        this.phoneCtrl.updateValueAndValidity();
    }


  // function test error
  getFormControlErrorText(ctrl: AbstractControl) {
      if (ctrl.hasError('required')) {
        return 'Ce champ est requis';
    } else if (ctrl.hasError('email')) {
        return 'Merci d\'entrer une adresse mail valide';
    } else if (ctrl.hasError('minlength')) {
        return 'Ce numéro de téléphone ne contient pas assez de chiffres';
    } else if (ctrl.hasError('maxlength')) {
        return 'Ce numéro de téléphone contient trop de chiffres';
    }
    else if (ctrl.hasError('validValidator')) {
      return 'Ce texte ne contient pas le mot VALID';
    } else {
          return 'Ce champ contient une erreur';
      }
  }

  //save value of forms
  onSubmitForm() {
    this.loading = true;
    this.ComplexFormService.saveUserInfo(this.mainForm.value).pipe(
        tap(saved => {
            this.loading = false;
            if (saved) {
                // user saved successfully
                this.resetForm();
            } else {
                // user not saved: error case
                console.error('Echec de l\'enregistrement');
            }
        })
    ).subscribe();
  }
  //reset formulaire aprés l'enregistrement
  private resetForm() {
    this.mainForm.reset();
    /* La méthode  patchValue , par défaut, fait émettre l'Observable
     valueChanges  du FormControl – la MatCard s'affichera */
    this.contactPreferenceCtrl.patchValue('email');
  }
}
