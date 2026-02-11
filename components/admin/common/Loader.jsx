import React from 'react';

export default function Loader({ size = 'medium', className = '' }) {
     const sizeClasses = {
          small: 'w-5 h-5 border-2',
          medium: 'w-8 h-8 border-3',
          large: 'w-12 h-12 border-4'
     };

     return (
          <div className={`flex justify-center items-center ${className}`}>
               <div className={`${sizeClasses[size] || sizeClasses.medium} border-gray-200 border-t-primary rounded-full animate-spin`}></div>
          </div>
     );
}
