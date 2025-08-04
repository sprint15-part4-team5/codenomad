import Input from '@/components/common/Input';
import { formatPrice } from '@/utils/formatPrice';
import { FieldValues, Path } from 'react-hook-form';
import { PriceInputProps } from './MyExperiences';

const PriceInput = <T extends FieldValues>({
  value,
  error,
  register,
  path,
  setValue,
}: PriceInputProps<T>) => {
  // 숫자만 허용하는 입력 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
    const numValue = Number(onlyNums);

    // 천만원(10,000,000) 이하만 허용
    if (numValue <= 10000000) {
      setValue(path as Path<T>, onlyNums as T[Path<T>], { shouldValidate: true });
    }
  };

  // register에서 onChange를 제외하고 다른 속성들만 사용
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onChange, ...registerProps } = register(path as Path<T>);

  return (
    <div className='mb-24'>
      <Input
        label='가격'
        labelClassName='text-16-b'
        placeholder='체험 금액을 입력해 주세요 (최대 1,000만원)'
        id='price-input'
        error={error}
        value={value}
        inputMode='numeric'
        type='text'
        onChange={handleChange}
        {...registerProps}
      />
      {value && <div className='text-14-r mt-2 text-gray-500'>{formatPrice(Number(value))}</div>}
    </div>
  );
};

export default PriceInput;
