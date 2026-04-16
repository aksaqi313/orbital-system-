"""
Example scenarios for the orbital system.
Run different orbital simulations: Earth-Moon, Solar System, Binary Stars, etc.
"""

from body import CelestialBody
from orbital_system import OrbitalSystem
from visualizer import OrbitalVisualizer


def create_earth_moon_system():
    """Create a simplified Earth-Moon system."""
    system = OrbitalSystem(dt=3600.0)  # 1 hour time steps
    
    # Earth (stationary for simplicity)
    earth = CelestialBody(
        name="Earth",
        mass=5.972e24,  # kg
        position=(0, 0),
        velocity=(0, 0),
        radius=6.371e6,  # meters
        color="blue"
    )
    
    # Moon (in orbit)
    moon = CelestialBody(
        name="Moon",
        mass=7.342e22,  # kg
        position=(3.844e8, 0),  # meters from Earth
        velocity=(0, 1022),  # m/s orbital velocity
        radius=1.737e6,
        color="gray"
    )
    
    system.add_body(earth)
    system.add_body(moon)
    return system


def create_simple_solar_system():
    """Create a simplified solar system (Sun, Earth, Venus)."""
    system = OrbitalSystem(dt=86400.0)  # 1 day time steps
    
    # Sun (stationary)
    sun = CelestialBody(
        name="Sun",
        mass=1.989e30,
        position=(0, 0),
        velocity=(0, 0),
        radius=6.96e8,
        color="yellow"
    )
    
    # Earth
    earth = CelestialBody(
        name="Earth",
        mass=5.972e24,
        position=(1.496e11, 0),  # 1 AU
        velocity=(0, 29780),  # m/s
        radius=6.371e6,
        color="blue"
    )
    
    # Venus
    venus = CelestialBody(
        name="Venus",
        mass=4.867e24,
        position=(1.082e11, 0),  # 0.72 AU
        velocity=(0, 35020),  # m/s
        radius=6.052e6,
        color="orange"
    )
    
    system.add_body(sun)
    system.add_body(earth)
    system.add_body(venus)
    return system


def create_binary_star_system():
    """Create a binary star system with a planet."""
    system = OrbitalSystem(dt=1000.0)
    
    # Star A
    star_a = CelestialBody(
        name="Star A",
        mass=1.989e30,  # Sun-like
        position=(-5e10, 0),
        velocity=(0, 10000),
        radius=6.96e8,
        color="yellow"
    )
    
    # Star B
    star_b = CelestialBody(
        name="Star B",
        mass=1.989e30,
        position=(5e10, 0),
        velocity=(0, -10000),
        radius=6.96e8,
        color="orange"
    )
    
    # Planet orbiting both stars
    planet = CelestialBody(
        name="Planet",
        mass=1e27,
        position=(0, 2e10),
        velocity=(20000, 0),
        radius=6.371e6,
        color="green"
    )
    
    system.add_body(star_a)
    system.add_body(star_b)
    system.add_body(planet)
    return system


def create_three_body_system():
    """Create a chaotic three-body system."""
    system = OrbitalSystem(dt=100.0)
    
    # Three equal mass bodies in a triangular formation
    mass = 1e30
    
    body1 = CelestialBody(
        name="Body 1",
        mass=mass,
        position=(0, 0),
        velocity=(50000, 0),
        radius=1e8,
        color="red"
    )
    
    body2 = CelestialBody(
        name="Body 2",
        mass=mass,
        position=(5e10, 0),
        velocity=(0, 50000),
        radius=1e8,
        color="blue"
    )
    
    body3 = CelestialBody(
        name="Body 3",
        mass=mass,
        position=(2.5e10, 4.33e10),
        velocity=(-25000, -25000),
        radius=1e8,
        color="green"
    )
    
    system.add_body(body1)
    system.add_body(body2)
    system.add_body(body3)
    return system


def run_example(system_name="earth-moon", num_steps=1000, visualize=True):
    """
    Run an orbital system example.
    
    Args:
        system_name: "earth-moon", "solar", "binary", or "three-body"
        num_steps: Number of simulation steps
        visualize: Whether to show visualization
    """
    systems = {
        "earth-moon": create_earth_moon_system,
        "solar": create_simple_solar_system,
        "binary": create_binary_star_system,
        "three-body": create_three_body_system,
    }
    
    if system_name not in systems:
        print(f"Unknown system: {system_name}")
        print(f"Available: {', '.join(systems.keys())}")
        return
    
    print(f"Creating {system_name} system...")
    system = systems[system_name]()
    
    print(f"Running simulation for {num_steps} steps...")
    system.run(num_steps, print_interval=100)
    
    print("\nFinal Status:")
    print(system.get_status())
    
    if visualize:
        print("\nGenerating visualization...")
        visualizer = OrbitalVisualizer(system)
        visualizer.show()
    
    # Save trajectory data
    system.save_trajectory(f"{system_name}_trajectory.txt")
    print(f"Trajectory saved to {system_name}_trajectory.txt")


if __name__ == "__main__":
    # Run examples - change system_name and num_steps as desired
    
    # Example 1: Earth-Moon system
    print("=" * 60)
    print("EARTH-MOON SYSTEM")
    print("=" * 60)
    run_example("earth-moon", num_steps=1000, visualize=True)
    
    # Example 2: Uncomment to run Solar System
    # run_example("solar", num_steps=500, visualize=True)
    
    # Example 3: Uncomment to run Binary Star System
    # run_example("binary", num_steps=500, visualize=True)
    
    # Example 4: Uncomment to run Three-Body System
    # run_example("three-body", num_steps=500, visualize=True)
