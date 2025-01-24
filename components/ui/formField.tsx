import { Input } from "./input";
import { Label } from "./label";

export const inputStyles = `w-full h-[52px] px-4 bg-white dark:bg-dark-input-bg border border-[#CACED8] dark:border-dark-border rounded-lg
text-base-regular dark:text-dark-text placeholder:text-[#64748B] dark:placeholder:text-dark-text/40
focus:border-primary dark:focus:border-primary outline-none transition-all
focus:shadow-[2px_2px_4px_0px_#26B8931A,-1px_-1px_4px_0px_#26B89333]`;
export const FormField = ({
    label,
    error,
    ...props
  }: {
    label: string;
    error?: string;
    [key: string]: any;
  }) => (
    <div className="flex-1">
      <Label className="block text-base-medium dark:text-dark-text mb-2">
        {label} {props.required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        className={`${inputStyles} ${error ? "border-red-500 focus:border-red-500 dark:focus:border-red-500" : ""}`}
        {...props}
      />
      {error && (
        <p className="text-sm font-medium text-destructive mt-2 text-red-500">
          {error}
        </p>
      )}
    </div>
  );