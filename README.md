# Orbital System Simulation

A Python-based orbital mechanics simulator that models gravitational interactions between celestial bodies.

## 🚀 Interactive Live Demos

Check out the interactive web-based simulations included in this repository:

*   **[Alarm Trigger System - Premium Dashboard](alarm_system/live_demo.html)**: A high-fidelity, interactive control panel with glassmorphism and real-time state simulation.

---

## Features


- **Physics Simulation**: Uses Newton's law of universal gravitation
- **Multiple Scenarios**: Earth-Moon, Solar System, Binary Stars, Three-Body System
- **Visualization**: Matplotlib-based visualization with trajectories
- **Energy Tracking**: Monitors kinetic energy and center of mass
- **Trajectory Recording**: Saves body trajectories for analysis

## Project Structure

```
orbital system/
├── alarm_system/        # Web-based interactive demos
│   ├── index.html       # Dashboard (Datalogger version)
│   └── live_demo.html   # Standalone enhanced demo (Recommended)
├── app.py               # Main Application Entry Point (Start here)
├── body.py              # CelestialBody physics class
├── orbital_system.py    # Simulation engine
├── visualizer.py        # 2D plotting tools
├── explorer_3d.py       # Interactive 3D visualization
├── config.py            # Simulation presets and constants
├── planets_data.py      # Solar system data
└── README.md            # Documentation
```

## Installation

### Requirements
- Python 3.7+
- matplotlib
- numpy

### Setup

```bash
pip install matplotlib numpy
```

## Usage

### Quick Start

Run the default Earth-Moon simulation:

```bash
python examples.py
```

### Custom Simulation

Create a custom orbital system:

```python
from body import CelestialBody
from orbital_system import OrbitalSystem
from visualizer import OrbitalVisualizer

# Create system
system = OrbitalSystem(dt=3600)  # 1-hour time steps

# Add bodies
sun = CelestialBody(
    name="Sun",
    mass=1.989e30,           # kg
    position=(0, 0),         # meters
    velocity=(0, 0),         # m/s
    radius=6.96e8,           # meters
    color="yellow"
)
system.add_body(sun)

# Run simulation
system.run(num_steps=1000, print_interval=100)

# Visualize
visualizer = OrbitalVisualizer(system)
visualizer.show()
```

### Available Examples

Run specific scenarios in `examples.py`:

1. **Earth-Moon**: `run_example("earth-moon")`
   - Simplified Earth-Moon orbital system
   - Short simulation timescale

2. **Solar System**: `run_example("solar")`
   - Sun, Earth, Venus
   - Realistic orbital parameters

3. **Binary Star**: `run_example("binary")`
   - Two equal-mass stars orbiting each other
   - Planet orbiting the binary pair

4. **Three-Body**: `run_example("three-body")`
   - Chaotic three-body system
   - Equal mass bodies in triangular formation

## Classes

### CelestialBody

Represents a single celestial object.

**Constructor Parameters:**
- `name` (str): Name of the body
- `mass` (float): Mass in kg
- `position` (tuple): (x, y) position in meters
- `velocity` (tuple): (vx, vy) velocity in m/s
- `radius` (float): Radius in meters (for visualization)
- `color` (str): Color for plotting

**Key Methods:**
- `update_acceleration(bodies, G)`: Calculate forces from all other bodies
- `update_velocity(dt)`: Update velocity based on acceleration
- `update_position(dt)`: Update position based on velocity
- `get_kinetic_energy()`: Calculate kinetic energy
- `get_info()`: Print body information

### OrbitalSystem

Main simulation controller.

**Constructor Parameters:**
- `dt` (float): Time step in seconds (default: 3600s = 1 hour)

**Key Methods:**
- `add_body(body)`: Add a CelestialBody to the system
- `step()`: Perform one simulation step
- `run(num_steps, print_interval)`: Run simulation for N steps
- `get_total_energy()`: Get total kinetic energy
- `get_center_of_mass()`: Get center of mass coordinates
- `get_status()`: Print detailed system status
- `save_trajectory(filename)`: Save trajectories to CSV

### OrbitalVisualizer

Handles plotting and visualization.

**Constructor Parameters:**
- `system` (OrbitalSystem): The system to visualize
- `figsize` (tuple): Figure size in inches

**Key Methods:**
- `update_plot()`: Update the visualization
- `show()`: Display the plot
- `save(filename)`: Save plot to image file

## Physics

### Gravitational Force

$$F = G \frac{m_1 m_2}{r^2}$$

Where:
- G = 6.674 × 10⁻¹¹ m³ kg⁻¹ s⁻²
- m₁, m₂ = masses of the bodies
- r = distance between bodies

### Acceleration

$$a = \frac{F}{m}$$

### Integration Method

The simulation uses Euler integration:
- Update acceleration based on current positions
- Update velocity: v = v + a × dt
- Update position: p = p + v × dt

## Parameters to Adjust

### Time Step (dt)

Smaller dt = more accurate but slower
- Gravity-heavy systems: 100-1000 seconds
- Orbital systems: 3600-86400 seconds
- Large-scale systems: 86400+ seconds

### Masses and Velocities

Real values (in kg and m/s):
- Earth mass: 5.972 × 10²⁴ kg
- Moon mass: 7.342 × 10²² kg
- Earth orbital velocity: ~29,780 m/s
- Moon orbital velocity: ~1,022 m/s

### Positions

Use realistic AU values:
- 1 AU = 1.496 × 10¹¹ meters
- Earth-Sun: 1 AU
- Mars-Sun: 1.52 AU
- Jupiter-Sun: 5.20 AU

## Troubleshooting

### Bodies Fly Apart
- **Cause**: Velocities too high or dt too large
- **Fix**: Increase dt, reduce initial velocities, or recalculate orbital velocity

### Orbit Not Circular
- **Cause**: Incorrect orbital velocity
- **Fix**: Use v = √(GM/r) to calculate correct velocity

### Simulation Too Slow
- **Cause**: dt too small
- **Fix**: Increase dt value, or reduce number of steps

### Bodies Crash Into Each Other
- **Cause**: Minimum distance check (1000m) prevents collision
- **Fix**: This is intentional to prevent numerical issues; adjust if needed

## Further Enhancements

Possible improvements:
- Relativistic corrections for high-speed orbits
- Collision detection and merging
- Atmospheric drag simulation
- Rotation and tidal forces
- Verlet or RK4 integration for better accuracy
- Real solar system data loader
- Interactive parameter adjustment
- 3D visualization

## References

- Newton's Law of Universal Gravitation
- Classical Orbital Mechanics
- N-Body Problem simulations
