# Spotlight.js

A lightweight, high-performance volumetric spotlight library for HTML pages.  
Mobile optimized and easy to integrate.

---

## Repository Contents

- **`spotlight-js-full.js`** → Core library file for volumetric spotlight functionality  
- min version coming soon

---
## 🎥 Demo

The spotlight effect in action:
[See Example demo](https://hi2rashid.github.io/spotlight-js-library/)
![Spotlight Demo](https://github.com/hi2rashid/spotlight-js-library/blob/main/spotlight-demo.gif)

## 🚀 Usage

```html
<script src="spotlight-js-full.js"></script>
<script>
  const mySpotlight = new Spotlight({
    container: document.getElementById('stage'),
    color: '#22c55e'
  });
</script>




### QUIK Start

#### Include via CDN in HTML

```html
<!-- In your <head> -->
<script src="https://cdn.jsdelivr.net/gh/hi2rashid/spotlight-js-library@main/spotlight-js-full.js"></script>
```

---

#### Minimal page setup

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Spotlight.js Demo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://cdn.jsdelivr.net/gh/hi2rashid/spotlight-js-library@main/spotlight-js-full.js"></script>
  <style>
    /* Optional base styles for demo */
    body { margin: 0; height: 100vh; background: #0f1217; color: #e3e7ef; }
    .content { padding: 2rem; }
  </style>
</head>
<body>
  <div class="content">
    <h1>Spotlight.js</h1>
    <p>Move your mouse to see the spotlight follow.</p>
  </div>

  <script>
    // Initialize a spotlight instance that follows the cursor
    const spotlight = new Spotlight({
      enabled: true,
      followCursor: true,
      // Focal circle
      circleEnabled: true,
      circleRadius: 120,
      circleGlow: 0.35,       // 0–1 intensity
      circleStrokeWidth: 3,
      circleColor: '#79c0ff',
      // Volumetric beam
      beamEnabled: true,
      beamLength: 320,
      beamSpread: 22,         // degrees
      beamIntensity: 0.55,    // 0–1
      beamColor: '#79c0ff',
      // Page masking
      maskEnabled: true,
      maskColor: 'rgba(0,0,0,0.75)',
      // Performance
      raf: true               // uses requestAnimationFrame
    });
  </script>
</body>
</html>
```

---

#### Configuration essentials

- **Enable/disable:** Turn features on or off at runtime.
  
```js
spotlight.update({ enabled: true, circleEnabled: true, beamEnabled: true, maskEnabled: true });
```

- **Circle styling:** Radius, color, glow, stroke.
  
```js
spotlight.update({
  circleRadius: 160,
  circleColor: '#14b8a6',
  circleGlow: 0.5,
  circleStrokeWidth: 2
});
```

- **Beam tuning:** Length, spread, intensity, color.
  
```js
spotlight.update({
  beamLength: 400,
  beamSpread: 30,
  beamIntensity: 0.7,
  beamColor: '#14b8a6'
});
```

- **Mask overlay:** Opacity and color of the page-darkening layer.
  
```js
spotlight.update({ maskColor: 'rgba(10, 12, 16, 0.8)' });
```

---

#### Targeting and movement

- **Follow cursor:** Let the spotlight track pointer movement.
  
```js
spotlight.update({ followCursor: true });
```

- **Manual position:** Fix the spotlight at a given coordinate.
  
```js
spotlight.update({ followCursor: false });
spotlight.setPosition({ x: 480, y: 260 });
```

- **Attach to element:** Center spotlight on a DOM element dynamically.
  
```js
const el = document.querySelector('.content h1');
const rect = el.getBoundingClientRect();
const x = rect.left + rect.width / 2;
const y = rect.top + rect.height / 2;
spotlight.update({ followCursor: false });
spotlight.setPosition({ x, y });
```

---

#### Lifecycle and cleanup

- **Temporarily hide:** Keep instance but turn off rendering.
  
```js
spotlight.update({ enabled: false });
```

- **Destroy completely:** Remove all DOM and event listeners.
  
```js
spotlight.destroy();
```

To "turn off" the spotlight without destroying the instance, you can simply update the opacities and glow sizes to zero.
It works like this: **On State**: Resets the configuration properties to their visible defaults as listed in the Configuration Options table of the Canvas.

Off State: Sets the beamOpacity to 0 and glowSize to 0px. It also hides the center dot and inner fill to effectively make the spotlight invisible while keeping the logic running in the background.


```js
// Function to toggle the spotlight
let isSpotlightOn = true;

function toggleSpotlight() {
    isSpotlightOn = !isSpotlightOn;
    
    if (isSpotlightOn) {
        // Restore to default/active state
        mySpotlight.setOptions({
            beamOpacity: 0.4,
            glowSize: '40px',
            showDot: true,
            showFill: true
        });
    } else {
        // "Turn off" by zeroing out visual elements
        mySpotlight.setOptions({
            beamOpacity: 0,
            glowSize: '0px',
            showDot: false,
            showFill: false
        });
    }
}

// Example: Toggle on a button click
document.getElementById('toggleBtn').addEventListener('click', toggleSpotlight);
```
---

#### Tips for smooth performance

- **Use requestAnimationFrame:** Keep `raf: true` for 60FPS interactions.
- **Limit reflows:** Batch updates using a single `spotlight.update({ ... })`.
- **Prefer CSS variables:** Colors and opacities can be centralized for theme control.
