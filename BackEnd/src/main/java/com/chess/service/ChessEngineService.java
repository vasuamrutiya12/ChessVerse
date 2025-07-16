package com.chess.service;

import com.chess.game.Move;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class ChessEngineService {
    
    @Value("${stockfish.path:C:\\stockfish\\stockfish-windows-x86-64-avx2.exe}")
    private String stockfishPath;
    
    @Value("${stockfish.analysis.depth:15}")
    private int analysisDepth;
    
    @Value("${stockfish.hint.depth:10}")
    private int hintDepth;
    
    public String getBestMove(String fen, int depth) {
        try {
            // Validate Stockfish path
            File stockfishFile = new File(stockfishPath);
            if (!stockfishFile.exists()) {
                System.err.println("Stockfish not found at: " + stockfishPath);
                return null;
            }
            
            Process stockfish = new ProcessBuilder(stockfishPath).start();
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(stockfish.getOutputStream()));
            BufferedReader reader = new BufferedReader(new InputStreamReader(stockfish.getInputStream()));
            
            // Initialize Stockfish
            writer.write("uci\n");
            writer.flush();
            
            // Wait for uciok
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.equals("uciok")) break;
            }
            
            // Set position
            writer.write("position fen " + fen + "\n");
            writer.flush();
            
            // Start analysis
            writer.write("go depth " + analysisDepth + "\n");
            writer.flush();
            
            String bestMove = null;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith("bestmove")) {
                    bestMove = line.split(" ")[1];
                    break;
                }
            }
            
            writer.write("quit\n");
            writer.flush();
            stockfish.waitFor(5, TimeUnit.SECONDS);
            stockfish.destroyForcibly();
            
            return bestMove;
            
        } catch (Exception e) {
            System.err.println("Error getting best move: " + e.getMessage());
            return null;
        }
    }
    
    public MoveAnalysis analyzeMove(String fen, String move) {
        try {
            // Validate Stockfish path
            File stockfishFile = new File(stockfishPath);
            if (!stockfishFile.exists()) {
                System.err.println("Stockfish not found at: " + stockfishPath);
                return new MoveAnalysis(move, 0, 0, null, "Unknown");
            }
            
            Process stockfish = new ProcessBuilder(stockfishPath).start();
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(stockfish.getOutputStream()));
            BufferedReader reader = new BufferedReader(new InputStreamReader(stockfish.getInputStream()));
            
            // Initialize
            writer.write("uci\n");
            writer.flush();
            
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.equals("uciok")) break;
            }
            
            // Analyze position before move
            writer.write("position fen " + fen + "\n");
            writer.flush();
            writer.write("go depth " + analysisDepth + "\n");
            writer.flush();
            
            int scoreBefore = 0;
            String bestMoveBefore = null;
            
            while ((line = reader.readLine()) != null) {
                if (line.startsWith("info") && line.contains("score cp")) {
                    String[] parts = line.split(" ");
                    for (int i = 0; i < parts.length - 1; i++) {
                        if (parts[i].equals("cp")) {
                            scoreBefore = Integer.parseInt(parts[i + 1]);
                            break;
                        }
                    }
                }
                if (line.startsWith("bestmove")) {
                    bestMoveBefore = line.split(" ")[1];
                    break;
                }
            }
            
            // Analyze position after move
            writer.write("go depth " + analysisDepth + "\n");
            writer.flush();
            writer.write("go depth " + analysisDepth + "\n");
            writer.flush();
            
            int scoreAfter = 0;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith("info") && line.contains("score cp")) {
                    String[] parts = line.split(" ");
                    for (int i = 0; i < parts.length - 1; i++) {
                        if (parts[i].equals("cp")) {
                            scoreAfter = -Integer.parseInt(parts[i + 1]); // Flip for opponent
                            break;
                        }
                    }
                }
                if (line.startsWith("bestmove")) {
                    break;
                }
            }
            
            writer.write("quit\n");
            writer.flush();
            stockfish.waitFor(5, TimeUnit.SECONDS);
            stockfish.destroyForcibly();
            
            return new MoveAnalysis(move, scoreBefore, scoreAfter, bestMoveBefore, 
                                  classifyMove(scoreBefore, scoreAfter, move.equals(bestMoveBefore)));
            
        } catch (Exception e) {
            System.err.println("Error analyzing move: " + e.getMessage());
            return new MoveAnalysis(move, 0, 0, null, "Unknown");
        }
    }
    
    public GameAnalysis analyzeGame(List<String> moves, String startingFen) {
        List<MoveAnalysis> moveAnalyses = new ArrayList<>();
        String currentFen = startingFen != null ? startingFen : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        
        int blunders = 0, mistakes = 0, inaccuracies = 0, excellent = 0, good = 0;
        double totalAccuracy = 0;
        
        for (String move : moves) {
            MoveAnalysis analysis = analyzeMove(currentFen, move);
            moveAnalyses.add(analysis);
            
            switch (analysis.getClassification()) {
                case "Blunder": blunders++; break;
                case "Mistake": mistakes++; break;
                case "Inaccuracy": inaccuracies++; break;
                case "Excellent": excellent++; break;
                case "Good": good++; break;
            }
            
            // Update FEN for next move (simplified - you'd need proper FEN updating)
            // currentFen = updateFenWithMove(currentFen, move);
        }
        
        double accuracy = moves.size() > 0 ? 
            (double)(excellent * 100 + good * 80 + (moves.size() - blunders - mistakes - inaccuracies) * 60) / (moves.size() * 100) * 100 : 0;
        
        return new GameAnalysis(moveAnalyses, accuracy, blunders, mistakes, inaccuracies, excellent, good);
    }
    
    private String classifyMove(int scoreBefore, int scoreAfter, boolean isBestMove) {
        int scoreDiff = scoreAfter - scoreBefore;
        
        if (isBestMove) return "Excellent";
        if (scoreDiff >= -10) return "Good";
        if (scoreDiff >= -50) return "Inaccuracy";
        if (scoreDiff >= -100) return "Mistake";
        return "Blunder";
    }
    
    // Inner classes for analysis results
    public static class MoveAnalysis {
        private String move;
        private int scoreBefore;
        private int scoreAfter;
        private String bestMove;
        private String classification;
        
        public MoveAnalysis(String move, int scoreBefore, int scoreAfter, String bestMove, String classification) {
            this.move = move;
            this.scoreBefore = scoreBefore;
            this.scoreAfter = scoreAfter;
            this.bestMove = bestMove;
            this.classification = classification;
        }
        
        // Getters
        public String getMove() { return move; }
        public int getScoreBefore() { return scoreBefore; }
        public int getScoreAfter() { return scoreAfter; }
        public String getBestMove() { return bestMove; }
        public String getClassification() { return classification; }
    }
    
    public static class GameAnalysis {
        private List<MoveAnalysis> moves;
        private double accuracy;
        private int blunders;
        private int mistakes;
        private int inaccuracies;
        private int excellent;
        private int good;
        
        public GameAnalysis(List<MoveAnalysis> moves, double accuracy, int blunders, 
                          int mistakes, int inaccuracies, int excellent, int good) {
            this.moves = moves;
            this.accuracy = accuracy;
            this.blunders = blunders;
            this.mistakes = mistakes;
            this.inaccuracies = inaccuracies;
            this.excellent = excellent;
            this.good = good;
        }
        
        // Getters
        public List<MoveAnalysis> getMoves() { return moves; }
        public double getAccuracy() { return accuracy; }
        public int getBlunders() { return blunders; }
        public int getMistakes() { return mistakes; }
        public int getInaccuracies() { return inaccuracies; }
        public int getExcellent() { return excellent; }
        public int getGood() { return good; }
    }
}