"""
Advanced Examples - Custom orbital systems and parameter tuning
"""

from body import CelestialBody
from orbital_system import OrbitalSystem
from visualizer import OrbitalVisualizer
from config import (
    calculate_orbital_velocity,
    AU, EARTH_MASS, MOON_MASS, SUN_MASS,
    EARTH_RADIUS, MOON_RADIUS, SUN_RADIUS,
    EARTH_ORBITAL_VELOCITY, MOON_ORBITAL_VELOCITY,
)
import math


def example_custom_earth_moon():
    """
    Example: Custom Earth-Moon system with tunable parameters.
    Shows how to adjust orbital parameters and time step.
    """
    print("\n" + "="*60)
    print("EXAMPLE 1: Custom Earth-Moon (Tunable)")
    print("="*60)
    
    # Tunable parameters
    TIME_STEP = 7200  # 2 hour steps (larger = faster simulation)
    NUM_STEPS = 2000
    
    # Create system
    system = OrbitalSystem(dt=TIME_STEP)
    
    # Earth (slightly off-center for more interesting dynamics)
    earth = CelestialBody(
        name="Earth",
        mass=EARTH_MASS,
        position=(-1e23, 0),  # Offset from origin
        velocity=(0, 0),
        radius=EARTH_RADIUS,
        color="blue"
    )
    
    # Moon (with custom initial conditions)
    moon_distance = 3.844e8
    moon_velocity = calculate_orbital_velocity(EARTH_MASS, moon_distance)
    
    moon = CelestialBody(
        name="Moon",
        mass=MOON_MASS,
        position=(earth.position[0] + moon_distance, 0),
        velocity=(0, moon_velocity),
        radius=MOON_RADIUS,
        color="gray"
    )
    
    system.add_body(earth)
    system.add_body(moon)
    
    print(f"Time step: {TIME_STEP} seconds")
    print(f"Expected Moon orbital period: {(system.G * EARTH_MASS * moon_distance**2)**(-0.5) * 2 * math.pi / (24*3600):.2f} days")
    print(f"\nRunning {NUM_STEPS} steps...")
    system.run(NUM_STEPS, print_interval=500)
    
    print("\nFinal Energy Analysis:")
    print(f"Total KE: {system.get_total_energy():.2e} J")
    print(f"Center of Mass: {system.get_center_of_mass()}")
    
    return system


def example_two_suns_one_planet():
    """
    Example: Binary star system with orbiting planet.
    Demonstrates complex multi-body dynamics.
    """
    print("\n" + "="*60)
    print("EXAMPLE 2: Binary Star System with Planet")
    print("="*60)
    
    system = OrbitalSystem(dt=5000)
    
    # Star A (slightly more massive)
    star_a = CelestialBody(
        name="Star A",
        mass=SUN_MASS * 1.2,
        position=(-1e11, 0),
        velocity=(0, 0),
        radius=SUN_RADIUS,
        color="yellow"
    )
    
    # Star B
    star_b = CelestialBody(
        name="Star B",
        mass=SUN_MASS * 0.8,
        position=(1e11, 0),
        velocity=(0, 0),
        radius=SUN_RADIUS * 0.9,
        color="orange"
    )
    
    # Planet in the middle (stable position)
    planet = CelestialBody(
        name="Planet",
        mass=EARTH_MASS,
        position=(0, 3e10),
        velocity=(35000, 0),
        radius=EARTH_RADIUS,
        color="green"
    )
    
    system.add_body(star_a)
    system.add_body(star_b)
    system.add_body(planet)
    
    print("Running binary star simulation...")
    system.run(1000, print_interval=200)
    
    print("\nBinary Star System Status:")
    print(system.get_status())
    
    return system


def example_resonant_orbits():
    """
    Example: Multiple planets in resonant orbits.
    Demonstrates orbital resonance (e.g., 2:1 resonance).
    """
    print("\n" + "="*60)
    print("EXAMPLE 3: Resonant Planetary Orbits")
    print("="*60)
    
    system = OrbitalSystem(dt=86400)  # 1 day
    
    # Central star
    star = CelestialBody(
        name="Star",
        mass=SUN_MASS,
        position=(0, 0),
        velocity=(0, 0),
        radius=SUN_RADIUS,
        color="yellow"
    )
    system.add_body(star)
    
    # Inner planet (1:2 resonance)
    inner_distance = 0.5 * AU
    inner_velocity = calculate_orbital_velocity(SUN_MASS, inner_distance)
    
    inner_planet = CelestialBody(
        name="Inner Planet",
        mass=EARTH_MASS * 0.3,
        position=(inner_distance, 0),
        velocity=(0, inner_velocity),
        radius=EARTH_RADIUS,
        color="red"
    )
    system.add_body(inner_planet)
    
    # Outer planet (2:1 resonance with inner)
    outer_distance = 1.0 * AU
    outer_velocity = calculate_orbital_velocity(SUN_MASS, outer_distance)
    
    outer_planet = CelestialBody(
        name="Outer Planet",
        mass=EARTH_MASS * 0.5,
        position=(outer_distance, 0),
        velocity=(0, outer_velocity),
        radius=EARTH_RADIUS * 1.2,
        color="blue"
    )
    system.add_body(outer_planet)
    
    print("Running resonant orbit simulation...")
    print("Note: 2:1 resonance means inner planet orbits twice for every outer orbit")
    system.run(730, print_interval=100)  # ~2 years of outer planet
    
    return system


def example_elliptical_orbit():
    """
    Example: Create an elliptical orbit by adjusting initial velocity.
    This demonstrates orbital eccentricity.
    """
    print("\n" + "="*60)
    print("EXAMPLE 4: Elliptical Orbit")
    print("="*60)
    
    system = OrbitalSystem(dt=3600)
    
    # Central body
    primary = CelestialBody(
        name="Primary",
        mass=SUN_MASS,
        position=(0, 0),
        velocity=(0, 0),
        radius=SUN_RADIUS,
        color="yellow"
    )
    system.add_body(primary)
    
    # Satellite in elliptical orbit
    # Perihelion (closest point) at 0.5 AU
    perihelion = 0.5 * AU
    
    # Use circular orbit velocity at perihelion, then reduce it for ellipse
    circular_velocity = calculate_orbital_velocity(SUN_MASS, perihelion)
    elliptical_velocity = circular_velocity * 0.95  # Reduced for ellipse
    
    satellite = CelestialBody(
        name="Elliptical Satellite",
        mass=EARTH_MASS * 0.1,
        position=(perihelion, 0),
        velocity=(0, elliptical_velocity),
        radius=EARTH_RADIUS,
        color="purple"
    )
    system.add_body(satellite)
    
    print("Running elliptical orbit simulation...")
    print("The satellite will move faster near perihelion and slower at aphelion")
    system.run(2000, print_interval=500)
    
    return system


def example_unstable_three_body():
    """
    Example: Three-body system showing chaotic behavior.
    Small changes in initial conditions lead to drastically different outcomes.
    """
    print("\n" + "="*60)
    print("EXAMPLE 5: Chaotic Three-Body System")
    print("="*60)
    
    system = OrbitalSystem(dt=500)
    
    # Three equal-mass stars arranged in a triangle
    mass = SUN_MASS * 0.5
    distance = 2e11
    
    star1 = CelestialBody(
        name="Star 1",
        mass=mass,
        position=(0, 0),
        velocity=(40000, 40000),
        radius=SUN_RADIUS * 0.7,
        color="red"
    )
    
    star2 = CelestialBody(
        name="Star 2",
        mass=mass,
        position=(distance, 0),
        velocity=(-20000, 40000),
        radius=SUN_RADIUS * 0.7,
        color="blue"
    )
    
    star3 = CelestialBody(
        name="Star 3",
        mass=mass,
        position=(distance/2, distance * math.sqrt(3)/2),
        velocity=(-20000, -40000),
        radius=SUN_RADIUS * 0.7,
        color="yellow"
    )
    
    system.add_body(star1)
    system.add_body(star2)
    system.add_body(star3)
    
    print("Running chaotic three-body simulation...")
    print("Warning: This system is inherently unstable!")
    system.run(1000, print_interval=200)
    
    return system


def example_moon_capture():
    """
    Example: Demonstrate how a body might be captured into orbit.
    """
    print("\n" + "="*60)
    print("EXAMPLE 6: Moon Capture Simulation")
    print("="*60)
    
    system = OrbitalSystem(dt=10000)
    
    # Planet
    planet = CelestialBody(
        name="Planet",
        mass=EARTH_MASS * 100,
        position=(0, 0),
        velocity=(0, 0),
        radius=EARTH_RADIUS * 2,
        color="blue"
    )
    system.add_body(planet)
    
    # Incoming celestial body
    # Approaching with slower velocity than escape velocity
    approach_distance = 1e8
    approach_velocity = 15000  # Less than escape velocity
    
    incoming = CelestialBody(
        name="Incoming Body",
        mass=MOON_MASS * 10,
        position=(approach_distance, 0),
        velocity=(0, approach_velocity),
        radius=MOON_RADIUS,
        color="gray"
    )
    system.add_body(incoming)
    
    print("Running capture simulation...")
    print("Body approaching with sub-escape velocity...")
    system.run(5000, print_interval=1000)
    
    return system


def run_all_advanced_examples():
    """Run all advanced examples in sequence."""
    examples = [
        example_custom_earth_moon,
        example_two_suns_one_planet,
        example_resonant_orbits,
        example_elliptical_orbit,
        example_unstable_three_body,
        example_moon_capture,
    ]
    
    for i, example_func in enumerate(examples, 1):
        try:
            system = example_func()
            
            visualize = input(f"\nVisualize example {i}? (y/n): ").strip().lower() == 'y'
            if visualize:
                viz = OrbitalVisualizer(system)
                viz.show()
            
            save = input(f"Save trajectory for example {i}? (y/n): ").strip().lower() == 'y'
            if save:
                filename = f"advanced_example_{i}_trajectory.txt"
                system.save_trajectory(filename)
                print(f"Trajectory saved to {filename}")
            
        except Exception as e:
            print(f"Error in example {i}: {e}")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Run specific example
        example_num = int(sys.argv[1])
        examples = {
            1: example_custom_earth_moon,
            2: example_two_suns_one_planet,
            3: example_resonant_orbits,
            4: example_elliptical_orbit,
            5: example_unstable_three_body,
            6: example_moon_capture,
        }
        
        if example_num in examples:
            system = examples[example_num]()
            
            visualize = input("Visualize? (y/n): ").strip().lower() == 'y'
            if visualize:
                viz = OrbitalVisualizer(system)
                viz.show()
        else:
            print(f"Example {example_num} not found. Available: 1-6")
    else:
        # Interactive menu
        print("\n" + "="*60)
        print("ADVANCED ORBITAL SYSTEM EXAMPLES")
        print("="*60)
        print("\n1. Custom Earth-Moon")
        print("2. Binary Star System")
        print("3. Resonant Orbits")
        print("4. Elliptical Orbit")
        print("5. Chaotic Three-Body")
        print("6. Moon Capture")
        print("7. Run All Examples")
        
        choice = input("\nSelect example (1-7): ").strip()
        
        if choice == "7":
            run_all_advanced_examples()
        elif choice.isdigit() and 1 <= int(choice) <= 6:
            examples = {
                1: example_custom_earth_moon,
                2: example_two_suns_one_planet,
                3: example_resonant_orbits,
                4: example_elliptical_orbit,
                5: example_unstable_three_body,
                6: example_moon_capture,
            }
            system = examples[int(choice)]()
            
            visualize = input("Visualize? (y/n): ").strip().lower() == 'y'
            if visualize:
                viz = OrbitalVisualizer(system)
                viz.show()
