export class ComplexFormValue {
  //name and last name
  personalInfo!: {
    firstName: string,
    lastName: string
  };
  //contact
  contactPreference!: string;
  //email
  email?: {
    email: string,
    confirm: string
  };
  //phone
  phone?: string;
  //auth informations
  loginInfo!: {
    username: string,
    password: string,
    confirmPassword: string,
  };
}
