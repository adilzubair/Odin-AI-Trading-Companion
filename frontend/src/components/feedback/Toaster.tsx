"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="dark"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast: "group toast group-[.toaster]:bg-[#121212] group-[.toaster]:text-white group-[.toaster]:border-white/[0.08] group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-gray-400",
                    actionButton: "group-[.toast]:bg-white group-[.toast]:text-black",
                    cancelButton: "group-[.toast]:bg-white/10 group-[.toast]:text-white",
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
