# Orbital System - Project Summary

A complete Python orbital mechanics simulator with multiple examples and visualization tools.

## Project Contents

### Core Modules

1. **body.py** - CelestialBody Class
   - Represents individual celestial objects
   - Handles gravitational force calculations
   - Updates position and velocity using physics
   - Tracks trajectory history

2. **orbital_system.py** - OrbitalSystem Class
   - Main simulation engine
   - Manages multiple bodies
   - Performs time-stepping integration
   - Calculates system energy and center of mass

3. **visualizer.py** - OrbitalVisualizer Class
   - Matplotlib-based visualization
   - Plots body positions and trajectories
   - Shows center of mass
   - Can save images

4. **config.py** - Configuration and Utilities
   - Physical constants and unit conversions
   - Helper functions for orbital calculations
   - 6 preset scenarios with realistic parameters
   - Configuration profiles

### Example Scripts

1. **examples.py** - Basic Examples
   - Earth-Moon system
   - Solar System (Sun, Earth, Venus)
   - Binary Star system
   - Three-Body system
   - Easy to run: `python examples.py`

2. **quick_start.py** - Interactive Quick Start
   - Menu-driven test selection
   - 4 different test scenarios
   - No setup required
   - Best for first-time users

3. **advanced_examples.py** - Advanced Scenarios
   - Custom parameter tuning
   - Binary star with planet
   - Resonant orbits
   - Elliptical orbits
   - Chaotic three-body
   - Moon capture simulation

## Quick Start Guide

### Installation

```bash
# Install dependencies
pip install matplotlib numpy

# No other setup needed - all files are ready to use
```

### Running Examples

**Option 1: Interactive Quick Start (Recommended for beginners)**
```bash
python quick_start.py
```
Choose from 4 preset scenarios with visualization.

**Option 2: Run Basic Examples**
```bash
python examples.py
```
Runs Earth-Moon system by default.

**Option 3: Advanced Examples**
```bash
python advanced_examples.py
```
Interactive menu for 6 advanced scenarios.

### Creating Your Own Simulation

```python
from body import CelestialBody
from orbital_system import OrbitalSystem
from visualizer import OrbitalVisualizer

# Create system with 1-hour time steps
system = OrbitalSystem(dt=3600)

# Add a star
star = CelestialBody(
    name="Star",
    mass=1.989e30,
    position=(0, 0),
    velocity=(0, 0),
    radius=6.96e8,
    color="yellow"
)
system.add_body(star)

# Add a planet
planet = CelestialBody(
    name="Planet",
    mass=5.972e24,
    position=(1.496e11, 0),
    velocity=(0, 29780),
    radius=6.371e6,
    color="blue"
)
system.add_body(planet)

# Run simulation
system.run(num_steps=1000)

# Visualize
visualizer = OrbitalVisualizer(system)
visualizer.show()
```

## Available Preset Scenarios (in config.py)

1. **earth-moon** - Realistic Earth-Moon with real parameters
2. **earth-moon-simple** - Scaled-down version for faster simulation
3. **sun-earth** - Sun-Earth orbital system
4. **solar-system** - Multi-planet solar system
5. **geostationary-test** - Geostationary satellite orbit
6. **escape-test** - Testing escape velocity

```python
from config import create_preset_scenario
from visualizer import OrbitalVisualizer

system = create_preset_scenario("sun-earth")
system.run(num_steps=365)
visualizer = OrbitalVisualizer(system)
visualizer.show()
```

## Physics Model

### Gravitational Force
$$F = G \frac{m_1 m_2}{r^2}$$

Where G = 6.674 × 10⁻¹¹ m³ kg⁻¹ s⁻²

### Acceleration
$$a = \frac{F}{m}$$

### Integration
- Uses Euler method (simple but effective)
- Updates: acceleration → velocity → position
- Time step: configurable (default 1 hour)

### Energy Tracking
- Kinetic Energy: KE = ½mv²
- System preserves energy over time

## Parameters

### Important Constants
```
EARTH_MASS = 5.972e24 kg
MOON_MASS = 7.342e22 kg
SUN_MASS = 1.989e30 kg
1 AU = 1.496e11 meters
EARTH_ORBITAL_VELOCITY = 29,780 m/s
```

### Time Steps
- **Small dt** (100-1000s): Accurate but slow
- **Medium dt** (3600s): Balanced
- **Large dt** (86400s): Fast but less accurate

### Orbital Velocity Formula
$$v = \sqrt{\frac{GM}{r}}$$

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Bodies fly apart | High velocities or large dt | Increase dt or reduce velocities |
| Orbit not circular | Wrong initial velocity | Use orbital_velocity formula |
| Simulation slow | Too many bodies or small dt | Increase dt |
| Crash/collision | Minimum distance error | Adjust time step |

## File Statistics

| File | Lines | Purpose |
|------|-------|---------|
| body.py | 118 | Core celestial body class |
| orbital_system.py | 93 | Main simulation engine |
| visualizer.py | 91 | Visualization and plotting |
| config.py | 280 | Constants and utilities |
| examples.py | 180 | Basic examples |
| quick_start.py | 130 | Interactive examples |
| advanced_examples.py | 380 | Advanced scenarios |
| README.md | 300+ | Full documentation |

**Total: ~1500 lines of well-documented Python code**

## Customization Tips

### Change Time Scale
```python
system = OrbitalSystem(dt=86400)  # Use days instead of hours
```

### Scale Down Distances
```python
scale = 1e6  # Scale down by million
earth_pos = (0, 0)
moon_pos = (3.844e8 / scale, 0)
```

### Modify Initial Conditions
```python
body = CelestialBody(
    name="Custom",
    mass=1e30,
    position=(1e11, 0),
    velocity=(0, 50000),  # Adjust speed
    radius=1e8,
    color="cyan"
)
```

### Change Integration Method
Edit `body.py` to implement RK4 or Verlet integration for higher accuracy.

## Learning Resources

**In Code:**
- Well-commented function definitions
- Type hints for clarity
- Docstrings explaining parameters

**In Documentation:**
- README.md: Full physics explanation
- Examples: Real-world scenarios
- Config: Helper functions and constants

**To Learn More:**
- Research Kepler's Laws
- Study N-body problem
- Explore orbital mechanics textbooks

## Next Steps

1. **Try the quick start**: `python quick_start.py`
2. **Explore examples**: Modify velocity/mass in examples.py
3. **Create custom scenario**: Use your own initial conditions
4. **Experiment with parameters**: Time step, masses, distances
5. **Implement improvements**: RK4 integration, 3D support, etc.

## License & Credits

This orbital system simulator was created as an educational tool for understanding orbital mechanics and gravitational interactions.

Suitable for:
- Education and learning
- Physics demonstrations
- Research and experimentation
- Visualizations and animations
