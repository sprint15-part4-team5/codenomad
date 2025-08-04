import { FieldValues, UseFormRegister, UseFormSetValue } from 'react-hook-form';

// AddressInput
export interface AddressInputProps {
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

// TitleInput
export interface TitleInputProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  error?: string;
  value: string;
}

// PriceInput
export interface PriceInputProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  error?: string;
  value: string;
  path: string;
}

// DescriptionInput
export interface DescriptionInputProps<T extends FieldValues = FieldValues> {
  register: UseFormRegister<T>;
  error?: string;
  value: string;
}

// CategoryInput
export interface CategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
}

// BannerImageInput
export interface BannerImageInputProps {
  bannerPreview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  banner: File | null;
  isEdit?: boolean;
}

// IntroImagesInput
export interface IntroImagesInputProps {
  introPreviews: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (idx: number) => void;
}

// ReserveTimesInput
export interface ReserveTime {
  date: string;
  start: string;
  end: string;
}
export interface ReserveTimesInputProps {
  value: ReserveTime[];
  onChange: (value: ReserveTime[]) => void;
  isEdit?: boolean;
}
