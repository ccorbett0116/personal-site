// pages/centerMe.tsx
import React, { useState } from 'react';

interface CenteringMethod {
    id: number;
    name: string;
    component: React.ReactNode;
}

export default function CenterMePage() {
    const [currentMethod, setCurrentMethod] = useState<number>(1);

    // Method 1: Flexbox
    const FlexboxMethod: React.FC = () => (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
            <h1 className="text-white text-6xl font-bold text-center px-4">
                Cole Corbett
            </h1>
        </div>
    );

    // Method 2: CSS Grid
    const GridMethod: React.FC = () => (
        <div className="fixed inset-0 grid place-items-center bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
            <h1 className="text-white text-6xl font-bold text-center px-4">
                Cole Corbett
            </h1>
        </div>
    );

    // Method 3: Absolute positioning
    const AbsoluteMethod: React.FC = () => (
        <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-teal-900 to-blue-900">
            <h1
                className="text-white text-6xl font-bold absolute whitespace-nowrap px-4"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}
            >
                Cole Corbett
            </h1>
        </div>
    );

    // Method 4: Table-like with flexbox
    const TableMethod: React.FC = () => (
        <div className="fixed inset-0 bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900">
            <div className="w-full h-full flex">
                <div className="flex-1 flex items-center justify-center">
                    <h1 className="text-white text-6xl font-bold text-center px-4">
                        Cole Corbett
                    </h1>
                </div>
            </div>
        </div>
    );

    // Method 5: Using min-height approach (your current setup)
    const MinHeightMethod: React.FC = () => (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
            <div className="min-h-screen flex flex-col items-center justify-center px-4">
                <h1 className="text-white text-6xl font-bold text-center">
                    Cole Corbett
                </h1>
            </div>
        </div>
    );

    const methods: CenteringMethod[] = [
        { id: 1, name: "Flexbox (items-center justify-center)", component: <FlexboxMethod /> },
        { id: 2, name: "CSS Grid (place-items-center)", component: <GridMethod /> },
        { id: 3, name: "Absolute Position (translate)", component: <AbsoluteMethod /> },
        { id: 4, name: "Table-like Flexbox", component: <TableMethod /> },
        { id: 5, name: "Min-height Approach", component: <MinHeightMethod /> }
    ];

    const switchMethod = (): void => {
        setCurrentMethod(prev => prev === methods.length ? 1 : prev + 1);
    };

    const currentMethodData = methods.find(method => method.id === currentMethod);

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Method indicator */}
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-medium">
                {currentMethodData?.name}
            </div>

            {/* Render current method */}
            {currentMethodData?.component}

            {/* Switch button */}
            <button
                onClick={switchMethod}
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur border border-white border-opacity-30 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105"
            >
                Switch Method ({currentMethod}/{methods.length})
            </button>

            {/* Debug info */}
            <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-xs">
                Test on Samsung Browser
            </div>

            {/* Mobile responsive styles */}
            <style jsx>{`
        @media (max-width: 768px) {
          h1 {
            font-size: 2.5rem !important;
          }
        }
        @media (max-width: 480px) {
          h1 {
            font-size: 2rem !important;
          }
        }
      `}</style>
        </div>
    );
}