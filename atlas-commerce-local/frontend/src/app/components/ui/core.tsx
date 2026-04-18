import * as React from 'react';

type SimpleClass = string | false | null | undefined;

function joinClasses(...parts: SimpleClass[]) {
  return parts.filter(Boolean).join(' ');
}

type ButtonVariant = 'default' | 'outline' | 'ghost';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

function Button({
  className,
  variant = 'default',
  size = 'default',
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  const variantClass = {
    default: 'text-white hover:opacity-90',
    outline: 'border bg-white hover:bg-gray-50',
    ghost: 'bg-transparent hover:bg-gray-100',
  }[variant];

  const sizeClass = {
    default: 'h-9 px-4 py-2 text-sm',
    sm: 'h-8 px-3 py-1.5 text-sm',
    lg: 'h-10 px-6 py-2 text-base',
    icon: 'h-9 w-9 p-0',
  }[size];

  return (
    <button
      type={type}
      className={joinClasses(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variantClass,
        sizeClass,
        className,
      )}
      {...props}
    />
  );
}

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={joinClasses('rounded-xl border bg-white text-[#2E2E2E]', className)}
      {...props}
    />
  );
}

function Input({ className, type = 'text', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={joinClasses(
        'h-9 w-full rounded-md border px-3 py-2 text-sm outline-none transition-shadow disabled:cursor-not-allowed disabled:opacity-50',
        'focus:ring-2 focus:ring-[#A5D6A7] focus:border-[#2E7D32]',
        className,
      )}
      {...props}
    />
  );
}

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={joinClasses('block text-sm font-medium text-[#2E2E2E]', className)}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={joinClasses(
        'w-full rounded-md border px-3 py-2 text-sm outline-none transition-shadow disabled:cursor-not-allowed disabled:opacity-50',
        'focus:ring-2 focus:ring-[#A5D6A7] focus:border-[#2E7D32]',
        className,
      )}
      {...props}
    />
  );
}

function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'outline';
}) {
  return (
    <span
      className={joinClasses(
        'inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium',
        variant === 'outline' ? 'border bg-white' : 'text-white',
        className,
      )}
      {...props}
    />
  );
}

export { Badge, Button, Card, Input, Label, Textarea };
