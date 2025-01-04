import React from 'react';

export function usePasswordToggle(): { showPassword: boolean; togglePasswordVisibility: () => void } {
    const [showPassword, setShowPassword] = React.useState(false);

    const togglePasswordVisibility = () => setShowPassword((prevState) => !prevState);

    return { showPassword, togglePasswordVisibility };
    
};