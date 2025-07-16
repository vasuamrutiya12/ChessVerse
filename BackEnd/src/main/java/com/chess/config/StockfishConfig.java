package com.chess.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;

@Configuration
public class StockfishConfig {

    @Value("${stockfish.path:C:\\stockfish\\stockfish-windows-x86-64-avx2.exe}")
    private String stockfishPath;

    @Bean
    public boolean validateStockfishInstallation() {
        File stockfishFile = new File(stockfishPath);
        boolean exists = stockfishFile.exists();
        
        if (exists) {
            System.out.println("✅ Stockfish found at: " + stockfishPath);
        } else {
            System.err.println("❌ Stockfish NOT found at: " + stockfishPath);
            System.err.println("Please ensure Stockfish is installed and the path is correct.");
            System.err.println("You can download Stockfish from: https://stockfishchess.org/download/");
        }
        
        return exists;
    }
}