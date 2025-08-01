import Input from '@/components/common/Input';
import { formatPrice } from '@/utils/formatPrice';
import { FieldValues, Path } from 'react-hook-form';
import { PriceInputProps } from './MyExperiences';

const PriceInput = <T extends FieldValues>({
  value,
  error,
  register,
  path,
}: PriceInputProps<T>) => {
  // IME, 붙여넣기 등 모든 입력에서 숫자만 남기기
  const handleInput = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    // input 엘리먼트에서만 동작
    if (e.currentTarget instanceof HTMLInputElement) {
      const onlyNums = e.currentTarget.value.replace(/[^0-9]/g, '');
      if (e.currentTarget.value !== onlyNums) {
        e.currentTarget.value = onlyNums;
        // react-hook-form 값도 동기화
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        )?.set;
        nativeInputValueSetter?.call(e.currentTarget, onlyNums);
        e.currentTarget.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  return (
    <div className='mb-24'>
      <Input
        label='가격'
        labelClassName='text-16-b'
        placeholder='체험 금액을 입력해 주세요'
        error={error}
        value={value}
        inputMode='numeric'
        type='text'
        onInput={handleInput}
        {...register(path as Path<T>)}
      />
      {value && <div className='text-14-r mt-2 text-gray-500'>{formatPrice(Number(value))}</div>}
    </div>
  );
};

export default PriceInput;
