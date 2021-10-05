import * as React from "react";
import cx from "clsx";

// TODO: Light mode for docs usage

const Field = React.forwardRef<HTMLInputElement, FieldProps>((props, ref) => {
  let {
    type: inputType = "text",
    validationState = "valid",
    ...domProps
  } = props;
  return (
    <input
      type={inputType}
      ref={ref}
      {...domProps}
      className={getFieldClassNames(props)}
    />
  );
});

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => {
    let { validationState = "valid", ...domProps } = props;
    return (
      <select
        ref={ref}
        {...domProps}
        className={cx(getFieldClassNames(props), "select pr-7")}
      />
    );
  }
);

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (props, ref) => {
    let {
      // @ts-ignore
      type: _,
      className,
      validationState = "valid",
      ...domProps
    } = props;
    return (
      <input
        type="checkbox"
        ref={ref}
        {...domProps}
        className={cx(
          className,
          `appearance-none rounded h-5 w-5 form-check
           text-[color:var(--hue-0200)] hover:text-[color:var(--hue-0250)]
           checked:text-blue-500 hover:checked:text-blue-600 bg-current
           border ${
             validationState === "invalid"
               ? "border-red-500 focus:border-red-500"
               : "border-transparent focus:border-blue-500"
           }
           focus:outline-none focus:ring-2 ${
             validationState === "invalid"
               ? "focus:ring-red-500"
               : "focus:ring-blue-500"
           }`,
          // TODO: Don't add transtion states until after hydration to avoid FOUC
          "transition-colors duration-200",
          {
            // all disabled buttons
            ["pointer-events-none opacity-70"]: props.disabled,
          }
        )}
      />
    );
  }
);

const Radio = React.forwardRef<HTMLInputElement, RadioProps>((props, ref) => {
  let {
    // @ts-ignore
    type: _,
    className,
    validationState = "valid",
    ...domProps
  } = props;
  return (
    <input
      type="radio"
      ref={ref}
      {...domProps}
      className={cx(
        className,
        `appearance-none rounded-full h-5 w-5 form-dot
         text-[color:var(--hue-0200)] hover:text-[color:var(--hue-0250)]
         checked:text-blue-500 hover:checked:text-blue-600 bg-current
         border ${
           validationState === "invalid"
             ? "border-red-500 focus:border-red-500"
             : "border-transparent focus:border-blue-500"
         }
         focus:outline-none focus:ring-2 ${
           validationState === "invalid"
             ? "focus:ring-red-500"
             : "focus:ring-blue-500"
         }`,
        // TODO: Don't add transtion states until after hydration to avoid FOUC
        "transition-colors duration-200",
        {
          // all disabled buttons
          ["pointer-events-none opacity-70"]: props.disabled,
        }
      )}
    />
  );
});

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => {
    let { validationState = "valid", resize = "y", ...domProps } = props;
    return (
      <textarea
        ref={ref}
        {...domProps}
        className={cx(getFieldClassNames(props), {
          ["resize-none"]: resize === false,
          ["resize-x"]: resize === "x",
          ["resize-y"]: resize === "y",
        })}
      />
    );
  }
);

Field.displayName = "Field";
Textarea.displayName = "Textarea";

export { Field, Textarea, Checkbox, Radio, Select };
export type {
  FieldProps,
  TextareaProps,
  CheckboxProps,
  RadioProps,
  SelectProps,
};

function getFieldClassNames({
  className,
  disabled = false,
  validationState = "valid",
}: {
  className?: string;
  disabled?: boolean;
  validationState?: ValidationState;
}) {
  return cx(
    className,
    `flex-1 appearance-none w-full rounded
    py-2 px-3
    bg-[color:var(--hue-0200)] hover:bg-[color:var(--hue-0250)]
    border ${
      validationState === "invalid"
        ? "border-red-500 focus:border-red-500"
        : "border-transparent focus:border-blue-500"
    }
    placeholder-[color:var(--hue-0600)] text-base ${
      validationState === "invalid"
        ? "text-red-500"
        : "text-[color:var(--hue-1000)]"
    }
    focus:outline-none focus:ring-2 ${
      validationState === "invalid"
        ? "focus:ring-red-500"
        : "focus:ring-blue-500"
    }`,
    // TODO: Don't add transtion states until after hydration to avoid FOUC
    "transition-colors duration-200",
    {
      ["pointer-events-none opacity-70"]: disabled,
    }
  );
}

interface FieldSharedProps {
  validationState?: ValidationState;
}

type ValidationState = "valid" | "validating" | "invalid";

// Not intended to be exhaustive!
type InputType =
  | "email"
  | "text"
  | "hidden"
  | "password"
  | "search"
  | "tel"
  | "url";

interface FieldProps
  extends FieldSharedProps,
    Omit<React.ComponentPropsWithRef<"input">, "type"> {
  type?: InputType;
}

interface CheckboxProps
  extends FieldSharedProps,
    Omit<React.ComponentPropsWithRef<"input">, "type"> {}

interface RadioProps
  extends FieldSharedProps,
    Omit<React.ComponentPropsWithRef<"input">, "type"> {}

interface SelectProps
  extends FieldSharedProps,
    React.ComponentPropsWithRef<"select"> {}

interface TextareaProps
  extends FieldSharedProps,
    React.ComponentPropsWithRef<"textarea"> {
  resize?: "x" | "y" | boolean;
}
