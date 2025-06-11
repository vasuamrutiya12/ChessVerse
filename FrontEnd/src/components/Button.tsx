interface ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
}

export const Button = ({ 
    onClick, 
    children, 
    variant = 'primary', 
    size = 'md', 
    disabled = false,
    className = ''
}: ButtonProps) => {
    const baseClasses = "font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg";
    
    const variants = {
        primary: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/25",
        secondary: "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-slate-500/25",
        success: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/25",
        danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/25",
        outline: "border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white bg-transparent"
    };
    
    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    };
    
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed transform-none hover:scale-100" : "";
    
    return (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
        >
            {children}
        </button>
    );
}