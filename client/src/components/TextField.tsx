import { FieldValues, Path, UseFormRegister } from "react-hook-form";

import { cn } from "@/lib/utils";

interface TextFieldProps<T extends FieldValues> {
  label: string;
  register: UseFormRegister<T>;
  name: keyof T;
  errorMessage?: string;
  isInvalid?: boolean;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  type?:
    | "text"
    | "password"
    | "email"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "time"
    | "datetime-local"
    | "date";
  isAddress?: boolean;
  isTextArea?: boolean;
  className?: string;
}

function TextField<FormSchema extends FieldValues>({
  label,
  placeholder,
  type,
  isTextArea,
  name,
  register,
  disabled,
  errorMessage,
  isInvalid,
  isAddress,
  required,
  className,
}: TextFieldProps<FormSchema>) {
  return (
    <label className="flex-1 w-full flex flex-col">
      <span
        className={cn(
          "font-epilogue font-medium text-[14px] leading-[22px] text-[#808191] mb-[10px]",
          {
            "text-[#f44336]": isInvalid,
          }
        )}
      >
        {isInvalid ? errorMessage : label}
      </span>
      {isTextArea ? (
        <textarea
          {...register(name as Path<FormSchema>, { required })}
          rows={10}
          placeholder={placeholder}
          className={cn(
            "py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[14px] placeholder:text-[#4b5264] rounded-[10px] sm:min-w-[300px] focus:border-primaryPurple transition-colors duration-200",
            className
          )}
          disabled={disabled}
        />
      ) : (
        <input
          {...register(name as Path<FormSchema>, {
            required,
            pattern: isAddress ? /^0x[a-fA-F0-9]{40}$/ : undefined,
          })}
          type={type}
          step={0.1}
          placeholder={placeholder}
          className={cn(
            "py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[14px] placeholder:text-[#4b5264] rounded-[10px] sm:min-w-[300px] focus:border-primaryPurple transition-colors duration-200",
            {
              "border-[#f44336]": isInvalid,
            },
            className
          )}
          disabled={disabled}
        />
      )}
    </label>
  );
}

export default TextField;
