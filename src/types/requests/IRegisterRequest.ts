export default interface IRegisterRequest {
  name: string | null;
  email: string | null;
  password: string | null;
  confirmPassword: string | null;
}