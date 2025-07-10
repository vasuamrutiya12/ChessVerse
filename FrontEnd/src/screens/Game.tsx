import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/Button"
import { ChessBoard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket"
import { Chess, Square } from "chess.js";
import { GameOverPopup } from "../components/GameOverPopup";
import { useAuth } from "../hooks/useAuth";
import { GameRequests } from "../components/GameRequests";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const SEND_GAME_REQUEST = "send_game_request";
export const ACCEPT_GAME_REQUEST = "accept_game_request";
export const RESIGN = "resign";

export const Game = () => {
    const navigate = useNavigate();
    const [chess, setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [started, setStarted] = useState(false);
    const [playerColor, setPlayerColor] = useState<"white" | "black" | null>(null);
    const [isYourTurn, setIsYourTurn] = useState(false);
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(60);
    const [gameOver, setGameOver] = useState<{ winner: string; msg: string } | null>(null);
    const [showFriendsList, setShowFriendsList] = useState(true);
    const { userdetails } = useAuth();
    const [gameId, setGameId] = useState<string | null>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isWaiting, setIsWaiting] = useState(() => {
        return localStorage.getItem('isWaiting') === 'true';
    });

    useEffect(() => {
        if (!userdetails?.user?.email) return;

        const encodedEmail = encodeURIComponent(userdetails.user.email);
        const wsUrl = `ws://localhost:3000?email=${encodedEmail}`;
        console.log("Connecting to WebSocket:", wsUrl);
        
        const ws = new WebSocket(wsUrl);
        setSocket(ws);

        ws.onopen = () => {
            console.log("WebSocket connection opened successfully");
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("Received message:", message);

            switch (message.type) {
                case INIT_GAME:
                    console.log("Game initialized:", message.payload);
                    setIsYourTurn(message.isYourTurn);
                    setPlayerColor(message.payload.color);
                    setGameId(message.payload.gameId);
                    setStarted(true);
                    setBoard(chess.board());
                    setIsWaiting(false);
                    localStorage.removeItem('isWaiting');
                    break;
                case MOVE:
                    setIsYourTurn(message.isYourTurn);
                    const move = message.payload;
                    chess.move(move);
                    setBoard(chess.board());
                    break;
                case GAME_OVER:
                    setGameOver(message.payload);
                    break;
                case ACCEPT_GAME_REQUEST:
                    setStarted(true);
                    setPlayerColor(message.payload.color);
                    setGameId(message.payload.gameId);
                    setBoard(chess.board());
                    setIsWaiting(false);
                    localStorage.removeItem('isWaiting');
                    break;
            }
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                console.log("Closing WebSocket connection");
                ws.close();
            }
        };
    }, [userdetails?.user?.email]);

    useEffect(() => {
        return () => {
            if (!started) {
                localStorage.removeItem('isWaiting');
            }
        };
    }, [started]);

    const handleSquareClick = (square: Square | null) => {
        if (square === null) {
            setSelectedSquare(null);
        } else if (selectedSquare === square) {
            setSelectedSquare(null);
        } else {
            setSelectedSquare(square);
        }
    };

    const handleFriendGameRequest = async (friendEmail: string) => {
        try {
            const response = await fetch('https://chessverse-production.up.railway.app/game/sendgamerequest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    from: userdetails?.user?.email,
                    to: friendEmail
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                socket?.send(JSON.stringify({
                    type: SEND_GAME_REQUEST,
                    payload: {
                        to: friendEmail,
                        from: userdetails?.user?.email,
                        gameId: data.gameId
                    }
                }));
                alert('Game request sent successfully!');
            } else {
                alert('Failed to send game request');
            }
        } catch (error) {
            console.error('Error sending game request:', error);
            alert('Error sending game request');
        }
    };

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (isYourTurn && started && !gameOver) {
            setTimeLeft(60);
            timer = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        socket?.send(JSON.stringify({
                            type: GAME_OVER,
                            payload: {
                                winner: playerColor === 'white' ? 'black' : 'white',
                                msg: `${playerColor === 'white' ? 'Player2' : 'Player1'} WIN`
                            }
                        }));
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isYourTurn, started, gameOver, playerColor, socket]);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === SEND_GAME_REQUEST) {
                const accept = window.confirm(`${data.payload.from} wants to play with you. Accept?`);
                if (accept) {
                    socket.send(JSON.stringify({
                        type: ACCEPT_GAME_REQUEST,
                        payload: {
                            gameId: data.payload.gameId,
                            from: userdetails?.user?.email,
                            to: data.payload.from
                        }
                    }));
                }
            }
        };

        socket.addEventListener('message', handleMessage);
        return () => socket.removeEventListener('message', handleMessage);
    }, [socket, userdetails]);

    if (!socket) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <div className="text-white text-lg">Connecting to game server...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={() => navigate('/')}
                                className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center hover:scale-105 transition-transform"
                            >
                                <span className="text-white font-bold text-xl">♔</span>
                            </button>
                            <h1 className="text-2xl font-bold text-white">ChessMaster</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            {started && (
                                <Button 
                                    onClick={() => {
                                        if (socket) {
                                            socket.send(JSON.stringify({
                                                type: RESIGN,
                                                payload: {
                                                    gameId,
                                                }
                                            }));
                                        }
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Resign
                                </Button>
                            )}
                            {started && playerColor && (
                                <div className="flex items-center space-x-3">
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        playerColor === 'white' 
                                            ? 'bg-white text-slate-900' 
                                            : 'bg-slate-900 text-white border border-slate-600'
                                    }`}>
                                        Playing as {playerColor}
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        isYourTurn 
                                            ? 'bg-emerald-500 text-white' 
                                            : 'bg-slate-600 text-slate-300'
                                    }`}>
                                        {isYourTurn ? 'Your Turn' : 'Opponent\'s Turn'}
                                    </div>
                                </div>
                            )}
                            <div className="text-emerald-400 font-medium">
                                {userdetails?.user?.name}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {/* Chess Board */}
                    <div className="xl:col-span-3 flex justify-center">
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
                            <ChessBoard
                                chess={chess} 
                                setBoard={setBoard} 
                                socket={socket} 
                                board={board} 
                                playerColor={playerColor} 
                                selectedSquare={selectedSquare}
                                setSelectedSquare={handleSquareClick}  
                                isYourTurn={isYourTurn} 
                            />
                        </div>
                    </div>

                    {/* Game Panel */}
                    <div className="xl:col-span-1">
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl">
                            {/* Timer */}
                            {started && (
                                <div className="mb-6">
                                    <div className="text-center">
                                        <div className="text-slate-400 text-sm mb-2">Time Remaining</div>
                                        <div className={`text-3xl font-bold ${
                                            timeLeft <= 10 ? 'text-red-400' : 'text-emerald-400'
                                        }`}>
                                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                        </div>
                                        {timeLeft <= 10 && (
                                            <div className="text-red-400 text-sm animate-pulse">Hurry up!</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Game Controls */}
                            {!started && (
                                <div className="space-y-4">
                                    {isWaiting ? (
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                                            <div className="text-white font-medium">Waiting for opponent...</div>
                                            <div className="text-slate-400 text-sm mt-2">Finding the perfect match</div>
                                        </div>
                                    ) : (
                                        <Button 
                                            onClick={() => {
                                                socket?.send(JSON.stringify({
                                                    type: INIT_GAME
                                                }));
                                                setIsWaiting(true);
                                                localStorage.setItem('isWaiting', 'true');
                                            }}
                                            className="w-full"
                                            size="lg"
                                        >
                                            🎮 Quick Match
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Friends List */}
                            {!started && (
                                <div className="mt-6">
                                    <div className="flex p-3 justify-between items-baseline mb-4">
                                        <h3 className="text-lg  font-semibold text-white">
                                            {showFriendsList ? "Friends" : "Game Requests"}
                                        </h3>
                                        <Button 
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowFriendsList(!showFriendsList)}
                                        >
                                            {showFriendsList ? (
                                                <>
                                                    📜 Requests
                                                    {userdetails?.user?.game_requests?.length > 0 && (
                                                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                                            {userdetails.user.game_requests.length}
                                                        </span>
                                                    )}
                                                </>
                                            ) : "Friends"}
                                        </Button>
                                    </div>
                                    
                                    {showFriendsList ? (
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {userdetails?.user?.friend_list?.length > 0 ? (
                                                userdetails.user.friend_list.map((friend: string, index: number) => (
                                                    <div key={index} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-2 px-3 border border-slate-600/50">
                                                        <div className="flex items-center space-x-3 min-w-0">
                                                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <span className="text-white font-semibold text-sm">
                                                                    {friend.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span className="text-white text-sm truncate">{friend}</span>
                                                        </div>
                                                        <Button 
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() => handleFriendGameRequest(friend)}
                                                            className="flex-shrink-0"
                                                        >
                                                            ⚔️
                                                        </Button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8">
                                                    <div className="text-slate-400 text-sm">No friends yet</div>
                                                    <Button 
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate('/')}
                                                        className="mt-2"
                                                    >
                                                        Add Friends
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <GameRequests socket={socket} />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Popups */}
            {gameOver && (
                <GameOverPopup 
                    winner={gameOver.winner} 
                    message={gameOver.msg} 
                    onclose={() => navigate('/')} 
                />
            )}
        </div>
    );
}