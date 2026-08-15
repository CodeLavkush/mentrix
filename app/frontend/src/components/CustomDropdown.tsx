import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative select-none ${isOpen ? 'z-40' : 'z-10'} ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full glass-input px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all duration-200 cursor-pointer ${
          isOpen ? 'ring-2 ring-indigo-500/50 border-indigo-500' : 'border-slate-200 dark:border-slate-800'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300 dark:hover:border-slate-700'}`}
      >
        <div className="flex items-center space-x-2 truncate">
          {selectedOption?.icon && <span className="flex-shrink-0 text-indigo-400">{selectedOption.icon}</span>}
          <span className={`truncate font-medium ${selectedOption ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      {/* Menu Options */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full glass-panel border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl overflow-hidden py-1 max-h-60 overflow-y-auto backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 bg-white dark:bg-slate-950/95">
          {options.length === 0 ? (
            <div className="px-3.5 py-2.5 text-xs text-slate-500 text-center">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate pr-2">
                    {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                    <span className="truncate">{option.label}</span>
                    {option.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
