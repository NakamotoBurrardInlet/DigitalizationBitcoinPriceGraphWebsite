/* PROTOCOL OMEGA ENGINE */

// --- CONFIG ---
const CONFIG = {
    gridColor: '#004400',
    gridLinesH: 40, // High density horizontal lines
    gridLinesV: 60, // High density vertical lines
    chartColor: '#00ff00',
    chartFill: 'rgba(0, 255, 0, 0.1)',
    maxDataPoints: 200, // How many points on the graph
    updateSpeed: 1000,
};

// Global State
let priceData = [];
let currentPrice = 0;
let previousPrice = 0;

// --- 1. BACKGROUND NOISE (THE "1000s OF COLORS" MATRIX) ---
const initBackground = () => {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    
    // Resize handling
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const chars = "0123456789ABCDEF@#$%&";
    const columns = Math.floor(canvas.width / 15);
    const drops = Array(columns).fill(1);
    
    // Color Cycle State
    let hue = 0;

    const draw = () => {
        // Create fade effect (trail)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = '12px Courier New';
        
        // Cycle hue 360 degrees
        hue = (hue + 1) % 360; 

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            
            // Randomly pick a color from the spectrum for EACH character
            // This creates the "1000s of colors" sparkle
            const localHue = (hue + (i * 5)) % 360; 
            ctx.fillStyle = `hsl(${localHue}, 100%, 50%)`;
            
            ctx.fillText(text, i * 15, drops[i] * 15);

            if (drops[i] * 15 > canvas.height && Math.random() > 0.98) {
                drops[i] = 0;
            }
            drops[i]++;
        }
        requestAnimationFrame(draw);
    };
    draw();
};

// --- 2. HYPER-GRID CHART ENGINE ---
const initGridSystem = () => {
    const canvas = document.getElementById('grid-canvas');
    const ctx = canvas.getContext('2d');
    
    // Fit to container
    const resize = () => {
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Helper: Map value to Y coordinate
    const getY = (val, min, max) => {
        const range = max - min;
        const h = canvas.height;
        // Add 10% padding top/bottom
        const padding = h * 0.1;
        const workingH = h - (padding * 2);
        const percent = (val - min) / range;
        return h - padding - (percent * workingH);
    };

    const drawGrid = () => {
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // A. Draw Complex Grid (The "Fixed Size Grid Graph")
        ctx.lineWidth = 1;
        
        // Vertical Lines
        for(let i=0; i <= CONFIG.gridLinesV; i++) {
            ctx.beginPath();
            const x = (w / CONFIG.gridLinesV) * i;
            ctx.strokeStyle = (i % 5 === 0) ? '#006600' : '#002200'; // Major/Minor lines
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        // Horizontal Lines
        for(let i=0; i <= CONFIG.gridLinesH; i++) {
            ctx.beginPath();
            const y = (h / CONFIG.gridLinesH) * i;
            ctx.strokeStyle = (i % 5 === 0) ? '#006600' : '#002200';
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // B. Draw Data Line
        if(priceData.length < 2) return;

        // Calculate Scale
        const min = Math.min(...priceData) * 0.9995; // Zoomed in tight
        const max = Math.max(...priceData) * 1.0005;

        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#0f0';

        const stepX = w / (CONFIG.maxDataPoints - 1);
        
        // Start from right side (latest data) and work back
        // Or standard left-to-right. Let's do Standard.
        
        // We only draw as many points as we have, anchored to the right?
        // Let's anchor left for simplicity in this "Scanner" style.
        
        for(let i=0; i < priceData.length; i++) {
            const x = i * stepX;
            const y = getY(priceData[i], min, max);
            if(i===0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Fill Area
        ctx.lineTo((priceData.length - 1) * stepX, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = CONFIG.chartFill;
        ctx.fill();

        // Draw Puck (Current Price Point)
        const lastX = (priceData.length - 1) * stepX;
        const lastY = getY(priceData[priceData.length-1], min, max);
        ctx.beginPath();
        ctx.arc(lastX, lastY, 5, 0, Math.PI*2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        
        // Draw Crosshair lines on current price
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.setLineDash([5, 5]);
        ctx.moveTo(0, lastY);
        ctx.lineTo(w, lastY); // Horizontal
        ctx.moveTo(lastX, 0);
        ctx.lineTo(lastX, h); // Vertical
        ctx.stroke();
        ctx.setLineDash([]);
    };

    // Animation Loop for Grid
    const animate = () => {
        drawGrid();
        requestAnimationFrame(animate);
    };
    animate();
};

// --- 3. DATA & DECRYPTION EFFECTS ---

// Decrypt text effect: randomizes numbers before landing on target
const decryptText = (elementId, finalValue) => {
    const el = document.getElementById(elementId);
    let iterations = 0;
    const maxIterations = 10;
    const chars = '0123456789';

    const interval = setInterval(() => {
        el.innerText = finalValue.split('').map((char, index) => {
            if(index < iterations) return finalValue[index]; // Reveal logic could go here
            return chars[Math.floor(Math.random() * 10)];
        }).join('');
        
        // Simple "just scramble everything" approach
        el.innerText = (Math.random() * 100000).toFixed(0); 

        if (iterations >= maxIterations) {
            clearInterval(interval);
            el.innerText = finalValue;
        }
        iterations++;
    }, 30);
};

const fetchBinance = async () => {
    try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
        const data = await res.json();
        
        const price = parseFloat(data.lastPrice);
        
        // Store Data
        if(priceData.length > CONFIG.maxDataPoints) priceData.shift();
        priceData.push(price);

        // Update UI
        const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
        document.getElementById('main-price').innerText = formattedPrice;
        
        // 24h Change Color
        const change = parseFloat(data.priceChangePercent);
        const changeEl = document.getElementById('price-change');
        changeEl.innerText = change.toFixed(2) + '%';
        changeEl.style.color = change >= 0 ? '#0f0' : '#f00';

        // Update Stats with Decrypt Effect
        decryptText('vol-val', parseFloat(data.volume).toFixed(0));
        decryptText('high-val', parseFloat(data.highPrice).toFixed(2));
        decryptText('low-val', parseFloat(data.lowPrice).toFixed(2));
        
        // Terminal Log
        const log = document.getElementById('console-log');
        log.innerText = `> PACKET_RX: ${data.count} | BID: ${data.bidPrice} | ASK: ${data.askPrice}`;

    } catch (e) {
        console.error(e);
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initBackground();
    initGridSystem();
    
    // Initial fetch
    fetchBinance();
    // Fast polling for "high frequency" feel (every 1.5s)
    setInterval(fetchBinance, 1500);

    // Random Hex Stream Update
    setInterval(() => {
        const hex = document.querySelectorAll('.hex-stream');
        hex.forEach(h => {
            h.innerText = '0x' + Math.floor(Math.random()*16777215).toString(16).toUpperCase();
        });
    }, 200);
});