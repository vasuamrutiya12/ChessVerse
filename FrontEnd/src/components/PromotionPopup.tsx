import React from 'react';

interface PromotionPopupProps {
    onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
    onClose: () => void;
}

const PromotionPopup: React.FC<PromotionPopupProps> = ({ onSelect, onClose }) => {
    const pieces = [
        { type: 'q', name: 'Queen', icon: '♕' },
        { type: 'r', name: 'Rook', icon: '♖' },
        { type: 'b', name: 'Bishop', icon: '♗' },
        { type: 'n', name: 'Knight', icon: '♘' }
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Promote Your Pawn</h2>
                        <p className="text-slate-400">Choose which piece to promote to:</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {pieces.map((piece) => (
                            <button
                                key={piece.type}
                                onClick={() => onSelect(piece.type as 'q' | 'r' | 'b' | 'n')}
                                className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg p-4 transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                                <div className="text-4xl mb-2">{piece.icon}</div>
                                <div className="text-white font-medium">{piece.name}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromotionPopup;