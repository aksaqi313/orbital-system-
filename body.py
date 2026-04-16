import math
from typing import Tuple

class CelestialBody:
    """Represents a celestial body (planet, star, satellite) in the orbital system."""
    
    def __init__(self, name: str, mass: float, position: Tuple[float, float], 
                 velocity: Tuple[float, float], radius: float, color: str = "white"):
        """
        Initialize a celestial body.
        
        Args:
            name: Name of the body
            mass: Mass in kg
            position: (x, y) position in meters
            velocity: (vx, vy) velocity in m/s
            radius: Radius in meters (for visualization)
            color: Color for visualization
        """
        self.name = name
        self.mass = mass
        self.position = list(position)
        self.velocity = list(velocity)
        self.radius = radius
        self.color = color
        self.acceleration = [0.0, 0.0]
        self.trajectory = [self.position.copy()]
    
    def calculate_distance_to(self, other: 'CelestialBody') -> float:
        """Calculate distance to another body."""
        dx = other.position[0] - self.position[0]
        dy = other.position[1] - self.position[1]
        return math.sqrt(dx**2 + dy**2)
    
    def calculate_force_from(self, other: 'CelestialBody', G: float) -> Tuple[float, float]:
        """
        Calculate gravitational force exerted by another body.
        
        Args:
            other: The other celestial body
            G: Gravitational constant
            
        Returns:
            (fx, fy) - Force vector components
        """
        dx = other.position[0] - self.position[0]
        dy = other.position[1] - self.position[1]
        distance = math.sqrt(dx**2 + dy**2)
        
        if distance < 1000:  # Prevent division by very small numbers
            return (0, 0)
        
        # F = G * m1 * m2 / r^2
        force_magnitude = G * self.mass * other.mass / (distance ** 2)
        
        # Normalize direction and apply magnitude
        fx = (force_magnitude * dx) / distance
        fy = (force_magnitude * dy) / distance
        
        return (fx, fy)
    
    def update_acceleration(self, bodies: list, G: float):
        """Calculate total acceleration from all other bodies."""
        self.acceleration = [0.0, 0.0]
        
        for other in bodies:
            if other is self:
                continue
            
            fx, fy = self.calculate_force_from(other, G)
            # a = F / m
            self.acceleration[0] += fx / self.mass
            self.acceleration[1] += fy / self.mass
    
    def update_velocity(self, dt: float):
        """Update velocity based on acceleration (Euler integration)."""
        self.velocity[0] += self.acceleration[0] * dt
        self.velocity[1] += self.acceleration[1] * dt
    
    def update_position(self, dt: float):
        """Update position based on velocity."""
        self.position[0] += self.velocity[0] * dt
        self.position[1] += self.velocity[1] * dt
        self.trajectory.append(self.position.copy())
    
    def update(self, dt: float):
        """Update velocity and position."""
        self.update_velocity(dt)
        self.update_position(dt)
    
    def get_kinetic_energy(self) -> float:
        """Calculate kinetic energy."""
        v_squared = self.velocity[0]**2 + self.velocity[1]**2
        return 0.5 * self.mass * v_squared
    
    def get_info(self) -> str:
        """Return information about the body."""
        speed = math.sqrt(self.velocity[0]**2 + self.velocity[1]**2)
        ke = self.get_kinetic_energy()
        return (f"{self.name}:\n"
                f"  Position: ({self.position[0]:.2e}, {self.position[1]:.2e}) m\n"
                f"  Velocity: ({self.velocity[0]:.2e}, {self.velocity[1]:.2e}) m/s\n"
                f"  Speed: {speed:.2e} m/s\n"
                f"  KE: {ke:.2e} J")
