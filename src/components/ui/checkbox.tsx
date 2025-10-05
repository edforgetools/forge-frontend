import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
  {
    variants: {
      variant: {
        default: "border-primary",
        destructive:
          "border-destructive data-[state=checked]:bg-destructive data-[state=checked]:text-destructive-foreground",
        outline:
          "border-2 border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary",
      },
      size: {
        default: "h-4 w-4",
        sm: "h-3 w-3",
        lg: "h-5 w-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof checkboxVariants> {
  /**
   * The checked state of the checkbox
   */
  checked?: boolean;
  /**
   * The default checked state (uncontrolled)
   */
  defaultChecked?: boolean;
  /**
   * Whether the checkbox is in an indeterminate state
   */
  indeterminate?: boolean;
  /**
   * Callback fired when the checked state changes
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Additional class name for the checkbox
   */
  className?: string;
  /**
   * Whether the checkbox is required
   */
  required?: boolean;
  /**
   * The name of the checkbox (for form submission)
   */
  name?: string;
  /**
   * The value of the checkbox (for form submission)
   */
  value?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      variant,
      size,
      checked,
      defaultChecked,
      indeterminate = false,
      onCheckedChange,
      onChange,
      onKeyDown,
      required = false,
      disabled = false,
      name,
      value,
      id,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(
      defaultChecked ?? false
    );
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked = event.target.checked;

        if (!isControlled) {
          setInternalChecked(newChecked);
        }

        onCheckedChange?.(newChecked);
        onChange?.(event);
      },
      [isControlled, onCheckedChange, onChange]
    );

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle Enter and Space key presses for keyboard accessibility
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const newChecked = !isChecked;
          onCheckedChange?.(newChecked);
        }
        onKeyDown?.(event);
      },
      [isChecked, onCheckedChange, onKeyDown]
    );

    // Set indeterminate state on the input element
    React.useEffect(() => {
      if (ref && typeof ref === "object" && ref.current) {
        ref.current.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          id={id}
          name={name}
          value={value}
          checked={isChecked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          required={required}
          disabled={disabled}
          aria-checked={indeterminate ? "mixed" : isChecked}
          aria-required={required}
          aria-disabled={disabled}
          data-state={
            indeterminate
              ? "indeterminate"
              : isChecked
              ? "checked"
              : "unchecked"
          }
          {...props}
        />
        <div
          className={cn(checkboxVariants({ variant, size }), className)}
          role="checkbox"
          tabIndex={disabled ? -1 : 0}
          aria-checked={indeterminate ? "mixed" : isChecked}
          aria-required={required}
          aria-disabled={disabled}
          data-state={
            indeterminate
              ? "indeterminate"
              : isChecked
              ? "checked"
              : "unchecked"
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              const newChecked = !isChecked;
              onCheckedChange?.(newChecked);
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            const newChecked = !isChecked;
            onCheckedChange?.(newChecked);
          }}
        >
          <Check
            className={cn(
              "h-3 w-3 text-current transition-opacity",
              size === "sm" && "h-2 w-2",
              size === "lg" && "h-4 w-4",
              isChecked || indeterminate ? "opacity-100" : "opacity-0"
            )}
            strokeWidth={indeterminate ? 4 : 2}
          />
          {indeterminate && !isChecked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={cn(
                  "bg-current transition-opacity",
                  size === "sm" && "h-1 w-2",
                  size === "default" && "h-1 w-3",
                  size === "lg" && "h-1.5 w-4"
                )}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox, checkboxVariants };
