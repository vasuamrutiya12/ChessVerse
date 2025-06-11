import { Color, PieceSymbol, Square } from "chess.js";
import { useState, useEffect, useCallback } from "react";
import { MOVE } from "../screens/Game";
import PromotionPopup from "./PromotionPopup";

export const ChessBoard = ({ chess, board, socket, setBoard, playerColor, selectedSquare, setSelectedSquare, isYourTurn }: {
    chess: any;
    setBoard: any;
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][];
    socket: WebSocket;
    playerColor: "white" | "black" | null;
    selectedSquare: Square | null;
    setSelectedSquare: (square: Square | null) => void;
    isYourTurn: boolean;
}) => {
    const [from, setFrom] = useState<Square | null>(null);
    const [promotionMove, setPromotionMove] = useState<{ from: Square, to: Square } | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
    
    const reversedBoard = playerColor === "black" ? [...board].reverse().map(row => [...row].reverse()) : board;

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.chess-board')) {
                setSelectedSquare(null);
                setFrom(null);
                setPossibleMoves([]);
            }
        };

        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [setSelectedSquare]);

    // Calculate possible moves when a piece is selected
    useEffect(() => {
        if (from && isYourTurn) {
            const moves = chess.moves({ square: from, verbose: true });
            setPossibleMoves(moves.map((move: any) => move.to));
        } else {
            setPossibleMoves([]);
        }
    }, [from, chess, isYourTurn]);

    const handleSquareClick = useCallback((squareRepresentation: Square) => {
        if (!isYourTurn) return;

        setSelectedSquare(squareRepresentation);

        if (!from) {
            const piece = chess.get(squareRepresentation);
            if (piece && piece.color === (playerColor === 'white' ? 'w' : 'b')) {
                setFrom(squareRepresentation);
            }
        } else {
            if (from === squareRepresentation) {
                setFrom(null);
                setPossibleMoves([]);
            } else {
                const move = {
                    from,
                    to: squareRepresentation
                };

                try {
                    const piece = chess.get(from);
                    const isPromotion = piece && piece.type === 'p' && (squareRepresentation[1] === '8' || squareRepresentation[1] === '1');

                    if (isPromotion) {
                        setPromotionMove(move);
                    } else {
                        const chessMove = chess.move(move);
                        if (chessMove) {
                            socket.send(JSON.stringify({
                                type: MOVE,
                                payload: {
                                    move: move
                                }
                            }));
                            setFrom(null);
                            setBoard(chess.board());
                            setSelectedSquare(null);
                            setPossibleMoves([]);
                        } else {
                            const newPiece = chess.get(squareRepresentation);
                            if (newPiece && newPiece.color === (playerColor === 'white' ? 'w' : 'b')) {
                                setFrom(squareRepresentation);
                            } else {
                                setFrom(null);
                                setPossibleMoves([]);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error making move:", error);
                    setFrom(null);
                    setSelectedSquare(null);
                    setPossibleMoves([]);
                }
            }
        }
    }, [from, isYourTurn, chess, socket, setBoard, setSelectedSquare, playerColor]);

    const handlePromotion = useCallback((promotionPiece: 'q' | 'r' | 'b' | 'n') => {
        if (promotionMove) {
            const move = { ...promotionMove, promotion: promotionPiece };
            const chessMove = chess.move(move);
            if (chessMove) {
                socket.send(JSON.stringify({
                    type: MOVE,
                    payload: {
                        move: move
                    }
                }));
                setBoard(chess.board());
            }
            setPromotionMove(null);
            setFrom(null);
            setSelectedSquare(null);
            setPossibleMoves([]);
        }
    }, [chess, promotionMove, setBoard, socket]);

    const closePromotionPopup = useCallback(() => {
        setPromotionMove(null);
        setFrom(null);
        setSelectedSquare(null);
        setPossibleMoves([]);
    }, [setSelectedSquare]);

    const getSquareClasses = (i: number, j: number, squareRepresentation: Square) => {
        const isLight = (i + j) % 2 === 0;
        const isSelected = selectedSquare === squareRepresentation;
        const isFrom = from === squareRepresentation;
        const isPossibleMove = possibleMoves.includes(squareRepresentation);
        
        let classes = "w-16 h-16 sm:w-20 sm:h-20 relative transition-all duration-200 ";
        
        if (isSelected || isFrom) {
            classes += "bg-yellow-400 shadow-lg ";
        } else if (isPossibleMove) {
            classes += isLight ? "bg-emerald-300 " : "bg-emerald-400 ";
        } else {
            classes += isLight ? "bg-amber-100 " : "bg-amber-800 ";
        }
        
        if (!isYourTurn) {
            classes += "cursor-not-allowed opacity-75 ";
        } else {
            classes += "cursor-pointer hover:brightness-110 ";
        }
        
        return classes;
    };

    return (
        <div className="chess-board relative">
            {/* Coordinate labels */}
            <div className="flex">
                <div className="w-8"></div>
                {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="w-16 sm:w-20 text-center text-slate-400 text-sm font-medium">
                        {String.fromCharCode(97 + (playerColor === "black" ? 7 - i : i))}
                    </div>
                ))}
            </div>
            
            <div className="flex">
                <div className="flex flex-col">
                    {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className="w-8 h-16 sm:h-20 flex items-center justify-center text-slate-400 text-sm font-medium">
                            {playerColor === "black" ? i + 1 : 8 - i}
                        </div>
                    ))}
                </div>
                
                <div className="border-2 border-slate-600 rounded-lg overflow-hidden shadow-2xl">
                    {reversedBoard.map((row, i) => (
                        <div key={i} className="flex">
                            {row.map((square, j) => {
                                const file = playerColor === "black" ? 7 - j : j;
                                const rank = playerColor === "black" ? i : 7 - i;
                                const squareRepresentation = String.fromCharCode(97 + file) + (rank + 1) as Square;
                                const isPossibleMove = possibleMoves.includes(squareRepresentation);

                                return (
                                    <div 
                                        key={j} 
                                        onClick={() => handleSquareClick(squareRepresentation)} 
                                        className={getSquareClasses(i, j, squareRepresentation)}
                                    >
                                        {/* Possible move indicator */}
                                        {isPossibleMove && !square && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-4 h-4 bg-emerald-600 rounded-full opacity-70"></div>
                                            </div>
                                        )}
                                        
                                        {/* Capture indicator */}
                                        {isPossibleMove && square && (
                                            <div className="absolute inset-0 border-4 border-red-500 rounded-full opacity-70"></div>
                                        )}
                                        
                                        {/* Piece */}
                                        <div className="w-full h-full flex items-center justify-center relative z-10">
                                            {square && (
                                                <img 
                                                    className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-lg" 
                                                    src={`/${square?.color === "b" ?
                                                        square?.type: `${square?.type?.toUpperCase()} copy`}.png`} 
                                                    alt={`${square.color} ${square.type}`}
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            
            {promotionMove && (
                <PromotionPopup
                    onSelect={handlePromotion}
                    onClose={closePromotionPopup}
                />
            )}
        </div>
    );
}