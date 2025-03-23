// src/components/FormInput.tsx
import { ChangeEvent } from 'react';

interface FormInputProps {
  label: string;
  id: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function FormInput({ label, id, name, placeholder, value, onChange }: FormInputProps) {
  return (
    <div className="flex item-center justify-center w-1/2 my-2">
      <label className="w-auto block text-gray-700 pr-4" htmlFor={id}>
        {label}
      </label>
      <input
        type="text"
        required
        id={id}
        name={name}
        placeholder={placeholder}
        className="bg-white border-2 border-gray-200 rounded w-full p-2 text-gray-700 focus:outline-none focus:border-purple-500"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
