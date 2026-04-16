"""
Configuration and utilities for the orbital system.
Contains preset scenarios and helper functions.
"""

from body import CelestialBody
from orbital_system import OrbitalSystem


# Physical Constants
GRAVITATIONAL_CONSTANT = 6.67430e-11  # m^3 kg^-1 s^-2

# Distance Units
AU = 1.496e11  # Astronomical Unit in meters
EARTH_RADIUS = 6.371e6
MOON_RADIUS = 1.737e6
SUN_RADIUS = 6.96e8
JUPITER_RADIUS = 7.149e7

# Mass Units
EARTH_MASS = 5.972e24
MOON_MASS = 7.342e22
SUN_MASS = 1.989e30
JUPITER_MASS = 1.898e27

# Velocity Units (orbital velocities in m/s)
EARTH_ORBITAL_VELOCITY = 29780
MOON_ORBITAL_VELOCITY = 1022
MERCURY_ORBITAL_VELOCITY = 47360
VENUS_ORBITAL_VELOCITY = 35020
MARS_ORBITAL_VELOCITY = 24070
JUPITER_ORBITAL_VELOCITY = 13070


def calculate_orbital_velocity(primary_mass, orbital_radius):
    """
    Calculate orbital velocity for a circular orbit.
    v = sqrt(G * M / r)
    """
    return (GRAVITATIONAL_CONSTANT * primary_mass / orbital_radius) ** 0.5


def calculate_orbital_period(primary_mass, orbital_radius):
    """
    Calculate orbital period using Kepler's third law.
    T = 2π * sqrt(r^3 / (G * M))
    Returns period in seconds.
    """
    import math
    return 2 * math.pi * (orbital_radius ** 3 / (GRAVITATIONAL_CONSTANT * primary_mass)) ** 0.5


def create_preset_scenario(scenario_name):
    """
    Create a preset orbital scenario.
    
    Available scenarios:
    - "earth-moon": Earth-Moon system with realistic parameters
    - "earth-moon-simple": Simplified Earth-Moon (scaled for faster simulation)
    - "sun-earth": Sun-Earth system
    - "solar-system": Multi-planet solar system
    - "geostationary-test": Testing geostationary orbit
    - "escape-test": Body attempting to escape from gravity well
    """
    
    scenarios = {
        "earth-moon": create_earth_moon_realistic,
        "earth-moon-simple": create_earth_moon_simple,
        "sun-earth": create_sun_earth,
        "solar-system": create_solar_system_full,
        "geostationary-test": create_geostationary_test,
        "escape-test": create_escape_test,
    }
    
    if scenario_name not in scenarios:
        print(f"Unknown scenario: {scenario_name}")
        print(f"Available: {', '.join(scenarios.keys())}")
        return None
    
    return scenarios[scenario_name]()


def create_earth_moon_realistic():
    """Earth-Moon system with real parameters."""
    system = OrbitalSystem(dt=3600)  # 1 hour steps
    
    earth = CelestialBody(
        name="Earth",
        mass=EARTH_MASS,
        position=(0, 0),
        velocity=(0, 0),
        radius=EARTH_RADIUS,
        color="blue"
    )
    
    moon_distance = 3.844e8
    moon_velocity = calculate_orbital_velocity(EARTH_MASS, moon_distance)
    
    moon = CelestialBody(
        name="Moon",
        mass=MOON_MASS,
        position=(moon_distance, 0),
        velocity=(0, moon_velocity),
        radius=MOON_RADIUS,
        color="gray"
    )
    
    system.add_body(earth)
    system.add_body(moon)
    return system


def create_earth_moon_simple():
    """Simplified Earth-Moon (scaled down for faster simulation)."""
    system = OrbitalSystem(dt=10000)  # Larger time steps
    
    # Scale down distances for visibility
    scale = 1e6
    
    earth = CelestialBody(
        name="Earth",
        mass=EARTH_MASS,
        position=(0, 0),
        velocity=(0, 0),
        radius=EARTH_RADIUS / scale,
        color="blue"
    )
    
    moon_distance = 3.844e8 / scale
    moon_velocity = calculate_orbital_velocity(EARTH_MASS, moon_distance * scale)
    
    moon = CelestialBody(
        name="Moon",
        mass=MOON_MASS,
        position=(moon_distance, 0),
        velocity=(0, moon_velocity),
        radius=MOON_RADIUS / scale,
        color="gray"
    )
    
    system.add_body(earth)
    system.add_body(moon)
    return system


def create_sun_earth():
    """Sun-Earth system."""
    system = OrbitalSystem(dt=86400)  # 1 day steps
    
    sun = CelestialBody(
        name="Sun",
        mass=SUN_MASS,
        position=(0, 0),
        velocity=(0, 0),
        radius=SUN_RADIUS,
        color="yellow"
    )
    
    earth_distance = 1.0 * AU
    earth_velocity = calculate_orbital_velocity(SUN_MASS, earth_distance)
    
    earth = CelestialBody(
        name="Earth",
        mass=EARTH_MASS,
        position=(earth_distance, 0),
        velocity=(0, earth_velocity),
        radius=EARTH_RADIUS,
        color="blue"
    )
    
    system.add_body(sun)
    system.add_body(earth)
    return system


def create_solar_system_full():
    """Multi-planet solar system."""
    system = OrbitalSystem(dt=86400)  # 1 day steps
    
    sun = CelestialBody(
        name="Sun",
        mass=SUN_MASS,
        position=(0, 0),
        velocity=(0, 0),
        radius=SUN_RADIUS,
        color="yellow"
    )
    system.add_body(sun)
    
    # Planet data: (name, distance_au, color)
    planets = [
        ("Mercury", 0.387, "gray"),
        ("Venus", 0.723, "orange"),
        ("Earth", 1.0, "blue"),
        ("Mars", 1.524, "red"),
    ]
    
    for name, distance_au, color in planets:
        distance = distance_au * AU
        velocity = calculate_orbital_velocity(SUN_MASS, distance)
        
        planet = CelestialBody(
            name=name,
            mass=EARTH_MASS * 0.5,  # Approximate
            position=(distance, 0),
            velocity=(0, velocity),
            radius=EARTH_RADIUS,
            color=color
        )
        system.add_body(planet)
    
    return system


def create_geostationary_test():
    """Test geostationary orbit around Earth."""
    system = OrbitalSystem(dt=3600)
    
    earth = CelestialBody(
        name="Earth",
        mass=EARTH_MASS,
        position=(0, 0),
        velocity=(0, 0),
        radius=EARTH_RADIUS,
        color="blue"
    )
    system.add_body(earth)
    
    # Geostationary orbit height
    geo_radius = 4.2164e7  # ~35,786 km above Earth's center
    geo_velocity = calculate_orbital_velocity(EARTH_MASS, geo_radius)
    
    satellite = CelestialBody(
        name="GeoSatellite",
        mass=1e25,  # Huge for visibility
        position=(geo_radius, 0),
        velocity=(0, geo_velocity),
        radius=EARTH_RADIUS * 0.1,
        color="green"
    )
    system.add_body(satellite)
    
    return system


def create_escape_test():
    """Test escape velocity scenario."""
    system = OrbitalSystem(dt=1000)
    
    massive_star = CelestialBody(
        name="Star",
        mass=SUN_MASS * 2,
        position=(0, 0),
        velocity=(0, 0),
        radius=SUN_RADIUS,
        color="yellow"
    )
    system.add_body(massive_star)
    
    # Escape velocity: v = sqrt(2 * G * M / r)
    distance = 1e11
    escape_vel = (2 * GRAVITATIONAL_CONSTANT * massive_star.mass / distance) ** 0.5
    
    test_object = CelestialBody(
        name="TestObject",
        mass=1e24,
        position=(distance, 0),
        velocity=(0, escape_vel * 1.1),  # 1.1x escape velocity
        radius=EARTH_RADIUS,
        color="red"
    )
    system.add_body(test_object)
    
    return system


# Configuration presets
CONFIG = {
    "PERFORMANCE": {
        "dt": 86400,
        "max_bodies": 10,
        "render_interval": 100,
    },
    "ACCURACY": {
        "dt": 100,
        "max_bodies": 20,
        "render_interval": 10,
    },
    "VISUALIZATION": {
        "dt": 3600,
        "max_bodies": 5,
        "render_interval": 1,
    },
}
