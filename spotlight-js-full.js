/**
 * Spotlight.js
 * A lightweight, high-performance volumetric spotlight library.
 *
 * Usage:
 * const mySpotlight = new Spotlight({
 *   container: document.getElementById('stage'),
 *   color: '#22c55e'
 * });
 *
 * Author: Abdul Rashid
 * Email: abdulrashid.a@outlook.com
 * License: Free to use
 */


class Spotlight {
    constructor(options = {}) {
        this.defaults = {
            container: document.body,
            color: '#22c55e',
            glowSize: '40px',
            showDot: true,
            showFill: true,
            sourcePosition: 'top', // 'top' | 'bottom'
            mode: 'mouse',         // 'mouse' | 'fixed'
            easing: 0.15,
            beamWidthSource: 30,
            beamWidthTarget: 60,
            beamOpacity: 0.4,
            focusSize: 120,
            // Masking Features
            maskMode: false,       // If true, darkens page except for the spotlight
            maskOpacity: 0.9       // Opacity of the darkened area (0 to 1)
        };

        this.options = { ...this.defaults, ...options };
        this.targetPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.currentPos = { ...this.targetPos };
        this.isDestroyed = false;

        Spotlight.injectStyles();
        this._initDOM();
        this._bindEvents();
        this._animate();
    }

    /**
     * Injects the necessary CSS for the library components.
     */
    static injectStyles() {
        if (document.getElementById('spotlight-core-styles')) return;
        const style = document.createElement('style');
        style.id = 'spotlight-core-styles';
        style.textContent = `
            .spotlight-container {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
            .spotlight-focus {
                position: absolute;
                pointer-events: none;
                z-index: 100; /* High z-index to stay above mask */
                transform: translate(-50%, -50%);
                border-radius: 50%;
                transition: background 0.3s ease;
            }
            .spotlight-focus::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border-radius: 50%;
            }
            .spotlight-beam-svg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 90;
            }
            .spotlight-mask {
                position: fixed;
                inset: 0;
                pointer-events: none;
                z-index: 80;
                background: black;
                display: none;
                -webkit-mask-repeat: no-repeat;
                mask-repeat: no-repeat;
            }
        `;
        document.head.appendChild(style);
    }

    _initDOM() {
        // 1. Create Focal Circle
        this.focusEl = document.createElement('div');
        this.focusEl.className = 'spotlight-focus';
        this.focusEl.style.width = this.focusEl.style.height = `${this.options.focusSize}px`;

        // 2. Create Mask Overlay
        this.maskEl = document.createElement('div');
        this.maskEl.className = 'spotlight-mask';

        // 3. Create SVG Beam
        const svgId = `beam-grad-${Math.random().toString(36).substr(2, 9)}`;
        this.svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svgContainer.setAttribute('class', 'spotlight-beam-svg');

        this.svgContainer.innerHTML = `
            <defs>
                <linearGradient id="${svgId}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop class="stop-start" offset="0%" style="stop-color:${this.options.color}; stop-opacity:${this.options.beamOpacity}" />
                    <stop class="stop-end" offset="100%" style="stop-color:${this.options.color}; stop-opacity:0" />
                </linearGradient>
            </defs>
            <polygon class="beam-poly" fill="url(#${svgId})" style="filter: blur(8px);" />
        `;

        this.beamPoly = this.svgContainer.querySelector('.beam-poly');
        
        // Ensure container is ready for absolute positioning
        if (this.options.container !== document.body) {
            this.options.container.classList.add('spotlight-container');
        }

        const parent = this.options.container;
        parent.appendChild(this.maskEl);
        parent.appendChild(this.svgContainer);
        parent.appendChild(this.focusEl);

        this.update();
    }

    _bindEvents() {
        this._handleMouseMove = (e) => {
            if (this.options.mode === 'mouse') {
                this.targetPos.x = e.clientX;
                this.targetPos.y = e.clientY;
            }
        };

        this._handleMouseDown = (e) => {
            if (this.options.mode === 'fixed') {
                this.targetPos.x = e.clientX;
                this.targetPos.y = e.clientY;
            }
        };

        window.addEventListener('mousemove', this._handleMouseMove);
        window.addEventListener('mousedown', this._handleMouseDown);
    }

    update() {
        const o = this.options;

        // Visuals
        this.focusEl.style.borderColor = o.color;
        this.focusEl.style.borderStyle = 'solid';
        this.focusEl.style.borderWidth = '2px';
        this.focusEl.style.boxShadow = `0 0 ${o.glowSize} ${o.color}, inset 0 0 calc(${o.glowSize} * 0.6) ${o.color}`;
        this.focusEl.style.background = o.showFill 
            ? `radial-gradient(circle, ${o.color}33 0%, transparent 70%)` 
            : 'transparent';

        // Internal Dot
        let dot = this.focusEl.querySelector('.spot-dot');
        if (!dot) {
            dot = document.createElement('div');
            dot.className = 'spot-dot';
            dot.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:50%;';
            this.focusEl.appendChild(dot);
        }
        dot.style.display = o.showDot ? 'block' : 'none';
        dot.style.width = dot.style.height = '8px';
        dot.style.background = o.color;
        dot.style.boxShadow = `0 0 10px ${o.color}`;

        // SVG Beam Gradient
        const stopStart = this.svgContainer.querySelector('.stop-start');
        const stopEnd = this.svgContainer.querySelector('.stop-end');
        stopStart.style.stopColor = o.color;
        stopEnd.style.stopColor = o.color;
        stopStart.style.stopOpacity = o.beamOpacity;

        const grad = this.svgContainer.querySelector('linearGradient');
        if (o.sourcePosition === 'bottom') {
            grad.setAttribute('y1', '100%'); grad.setAttribute('y2', '0%');
        } else {
            grad.setAttribute('y1', '0%'); grad.setAttribute('y2', '100%');
        }

        // Mask Control
        this.maskEl.style.display = o.maskMode ? 'block' : 'none';
        this.maskEl.style.backgroundColor = `rgba(0, 0, 0, ${o.maskOpacity})`;
    }

    setOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.update();
    }

    _animate() {
        if (this.isDestroyed) return;

        // Lerp movement
        this.currentPos.x += (this.targetPos.x - this.currentPos.x) * this.options.easing;
        this.currentPos.y += (this.targetPos.y - this.currentPos.y) * this.options.easing;

        // Update Focus Position
        this.focusEl.style.left = `${this.currentPos.x}px`;
        this.focusEl.style.top = `${this.currentPos.y}px`;

        // Update Beam Geometry
        const sourceX = window.innerWidth / 2;
        const sourceY = this.options.sourcePosition === 'bottom' ? window.innerHeight : 0;
        const sW = this.options.beamWidthSource;
        const tW = this.options.beamWidthTarget;

        this.beamPoly.setAttribute('points', 
            `${sourceX - sW},${sourceY} ${sourceX + sW},${sourceY} ` +
            `${this.currentPos.x + tW},${this.currentPos.y} ${this.currentPos.x - tW},${this.currentPos.y}`
        );

        // Update Masking Cutout
        if (this.options.maskMode) {
            const radius = this.options.focusSize / 2;
            const maskCSS = `radial-gradient(circle ${radius}px at ${this.currentPos.x}px ${this.currentPos.y}px, transparent 100%, black 100%)`;
            this.maskEl.style.webkitMaskImage = maskCSS;
            this.maskEl.style.maskImage = maskCSS;
        }

        requestAnimationFrame(() => this._animate());
    }

    destroy() {
        this.isDestroyed = true;
        window.removeEventListener('mousemove', this._handleMouseMove);
        window.removeEventListener('mousedown', this._handleMouseDown);
        this.focusEl.remove();
        this.svgContainer.remove();
        this.maskEl.remove();
    }
}
