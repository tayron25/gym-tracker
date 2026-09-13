export type WeightUnit = "kg" | "lb";

export type WeekStartsOn = 1 | 7;

export type AuthSession = {
  userId: string;
  email: string;
};

export type Profile = {
  displayName: string;
  weightUnit: WeightUnit;
  timezone: string;
  weekStartsOn: WeekStartsOn;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = SignInInput;

export type ProfileInput = Profile;

