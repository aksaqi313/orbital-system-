#!/usr/bin/env python
"""
Orbital System - Main Application Entry Point
Interactive orbital mechanics simulator with 2D and 3D visualization
"""

import sys
from config import create_preset_scenario
from visualizer import OrbitalVisualizer

# Try to import advanced features
try:
    from advanced_examples import run_advanced_examples
except ImportError:
    run_advanced_examples = None


def display_main_menu():
    """Display the main application menu."""
    print("\n" + "="*70)
    print(" 🌌 ORBITAL SYSTEM SIMULATION - MAIN APPLICATION 🌌")
    print("="*70)
    print("\nChoose a scenario:")
    print("\n  2D PRESET SCENARIOS:")
    print("  1. Earth-Moon (Simple) - Scaled for fast simulation")
    print("  2. Earth-Moon (Realistic) - Real orbital parameters")
    print("  3. Sun-Earth System - 1-year orbital period")
    print("  4. Solar System - Multi-planet system")
    print("  5. Geostationary Satellite Test")
    print("  6. Escape Velocity Test")
    print("\n  3D VISUALIZATION:")
    print("  7. 🌌 3D Solar System Explorer (INTERACTIVE)")
    print("\n  ADVANCED:")
    print("  8. Run Advanced Examples")
    print("  9. View Documentation")
    print("\n  CONTROLS:")
    print("  0. Exit")
    print("\n" + "="*70)


def run_preset_scenario(scenario_name, description):
    """Run a preset orbital scenario with visualization."""
    print(f"\n{'='*70}")
    print(f"Running: {description}")
    print(f"{'='*70}")
    
    try:
        system = create_preset_scenario(scenario_name)
        if system is None:
            print("Error: Could not create scenario")
            return
        
        print(f"\nInitial System Status:")
        print(system.get_status())
        
        # Determine number of steps based on scenario
        steps_map = {
            "earth-moon-simple": 500,
            "earth-moon": 1000,
            "earth": 365,
            "sun-earth": 365,
            "solar-system": 500,
            "geostationary-test": 1000,
            "escape-test": 1000,
        }
        
        num_steps = steps_map.get(scenario_name, 500)
        print(f"\nRunning simulation for {num_steps} steps...")
        system.run(num_steps, print_interval=max(1, num_steps // 5))
        
        print(f"\nFinal System Status:")
        print(system.get_status())
        
        # Ask for visualization
        viz_choice = input("\nVisualize results? (y/n): ").strip().lower()
        if viz_choice == 'y':
            print("Generating visualization...")
            visualizer = OrbitalVisualizer(system)
            visualizer.show()
        
        # Ask for trajectory save
        save_choice = input("\nSave trajectory data? (y/n): ").strip().lower()
        if save_choice == 'y':
            filename = f"{scenario_name}_trajectory.txt"
            system.save_trajectory(filename)
            print(f"✓ Trajectory saved to {filename}")
        
        return True
    
    except KeyboardInterrupt:
        print("\n\nSimulation interrupted by user.")
        return False
    except Exception as e:
        print(f"Error running scenario: {e}")
        import traceback
        traceback.print_exc()
        return False


def show_documentation():
    """Display help and documentation."""
    print("\n" + "="*70)
    print(" ORBITAL SYSTEM - DOCUMENTATION")
    print("="*70)
    
    docs = """
QUICK START GUIDE
=================

1. SELECT A SCENARIO
   - Choose from preset scenarios or run advanced examples
   - Each scenario has different initial conditions

2. SIMULATION RUNS
   - Physics calculations based on Newton's gravity law
   - Time-stepping integration with configurable time steps
   - Tracks position, velocity, acceleration, and energy

3. VISUALIZATION
   - Matplotlib plots show body positions and trajectories
   - Center of mass is marked with red X
   - Colors distinguish different celestial bodies

4. DATA EXPORT
   - Save trajectory data to CSV for further analysis
   - System status printed during and after simulation

PHYSICS MODEL
=============

Gravitational Force:  F = G * m1 * m2 / r^2
Acceleration:         a = F / m
Integration:          Euler method (v = v + a*dt, x = x + v*dt)

Where:
  G = 6.674 × 10⁻¹¹ m³ kg⁻¹ s⁻²
  m1, m2 = masses in kg
  r = distance in meters

AVAILABLE SCENARIOS
===================

EARTH-MOON (Simple):
  - Scaled version for faster simulation
  - Good for understanding orbital mechanics
  - 500 simulation steps

EARTH-MOON (Realistic):
  - Real Earth and Moon parameters
  - Realistic orbital period (~27 days)
  - 1000 simulation steps

SUN-EARTH:
  - Single Earth orbiting the Sun
  - 1-year orbital period
  - 365 simulation steps (1 day per step)

SOLAR SYSTEM:
  - Sun with multiple planets (Mercury, Venus, Earth, Mars)
  - Complex multi-body interactions
  - 500 simulation steps

GEOSTATIONARY SATELLITE:
  - Satellite in geostationary orbit
  - Tests orbital mechanics at specific altitude
  - 1000 simulation steps

ESCAPE VELOCITY:
  - Object attempting to escape star's gravity
  - Tests velocity calculations
  - 1000 simulation steps

CUSTOMIZATION
==============

Edit these files to customize:
  - config.py: Change constants, orbital parameters, presets
  - body.py: Modify physics calculations or add features
  - orbital_system.py: Adjust integration method or add forces
  - visualizer.py: Change plot appearance or add analysis

KEY FILES
=========

  body.py              - CelestialBody class
  orbital_system.py    - OrbitalSystem engine
  visualizer.py        - Matplotlib visualization
  config.py            - Constants and utilities
  examples.py          - Example scenarios
  quick_start.py       - Interactive quick start
  advanced_examples.py - Advanced simulation examples
  README.md            - Full documentation

FOR MORE INFORMATION
====================

See README.md for complete documentation
Run advanced_examples.py for more complex scenarios
Check config.py for physical constants and orbital formulas
"""
    print(docs)


def run_advanced_examples():
    """Launch the advanced examples script."""
    print("\nLaunching advanced examples...")
    print("(This will run as a separate script)")
    
    try:
        import subprocess
        subprocess.run([sys.executable, "advanced_examples.py"])
    except Exception as e:
        print(f"Error launching advanced examples: {e}")


def main():
    """Main application loop."""
    print("\nWelcome to the Orbital System Simulator!")
    print("Version 2.0 - Educational Physics Simulation with 3D Explorer")
    
    scenarios = {
        1: ("earth-moon-simple", "Earth-Moon System (Simplified)"),
        2: ("earth-moon", "Earth-Moon System (Realistic)"),
        3: ("sun-earth", "Sun-Earth Orbital System"),
        4: ("solar-system", "Multi-Planet Solar System"),
        5: ("geostationary-test", "Geostationary Satellite Orbit"),
        6: ("escape-test", "Escape Velocity Test"),
    }
    
    while True:
        display_main_menu()
        
        try:
            choice = input("Enter your choice (0-9): ").strip()
            
            if choice == "0":
                print("\nThank you for using Orbital System Simulator!")
                print("Goodbye! 🚀")
                break
            
            elif choice in ["1", "2", "3", "4", "5", "6"]:
                choice_num = int(choice)
                if choice_num in scenarios:
                    scenario_name, description = scenarios[choice_num]
                    run_preset_scenario(scenario_name, description)
            
            elif choice == "7":
                print("\n🌌 Launching 3D Solar System Explorer...")
                print("   Starting interactive 3D visualization...")
                print("   Press SPACE to pause/play, arrows to adjust speed")
                try:
                    from explorer_3d import SolarSystem3DExplorer
                    import matplotlib.pyplot as plt
                    
                    explorer = SolarSystem3DExplorer()
                    explorer.run(num_steps=2000)
                    plt.show()
                except ImportError as e:
                    print(f"❌ Could not load 3D Explorer: {e}")
                    print("   Make sure matplotlib is installed")
                except Exception as e:
                    print(f"❌ Error running 3D Explorer: {e}")
                    import traceback
                    traceback.print_exc()
            
            elif choice == "8":
                if run_advanced_examples:
                    try:
                        run_advanced_examples()
                    except Exception as e:
                        print(f"❌ Error: {e}")
                else:
                    print("❌ Advanced examples module not available")
            
            elif choice == "9":
                show_documentation()
            
            else:
                print("\n❌ Invalid choice. Please enter a number from 0-9.")
                input("Press Enter to continue...")
        
        except KeyboardInterrupt:
            print("\n\nApplication interrupted by user.")
            print("Goodbye! 🚀")
            break
        except ValueError:
            print("\n❌ Invalid input. Please enter a valid number.")
            input("Press Enter to continue...")
        except Exception as e:
            print(f"\n❌ An unexpected error occurred: {e}")
            input("Press Enter to continue...")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nApplication terminated by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\nFatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
