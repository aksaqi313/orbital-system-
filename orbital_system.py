import math
from typing import List
from body import CelestialBody


class OrbitalSystem:
    """Main orbital system simulation."""
    
    # Gravitational constant (m^3 kg^-1 s^-2)
    G = 6.67430e-11
    
    def __init__(self, dt: float = 3600.0):
        """
        Initialize the orbital system.
        
        Args:
            dt: Time step in seconds (default 1 hour)
        """
        self.bodies: List[CelestialBody] = []
        self.dt = dt
        self.time_elapsed = 0.0
        self.iteration = 0
    
    def add_body(self, body: CelestialBody):
        """Add a celestial body to the system."""
        self.bodies.append(body)
    
    def step(self):
        """Perform one simulation step."""
        # Update accelerations for all bodies
        for body in self.bodies:
            body.update_acceleration(self.bodies, self.G)
        
        # Update velocities and positions
        for body in self.bodies:
            body.update(self.dt)
        
        self.time_elapsed += self.dt
        self.iteration += 1
    
    def run(self, num_steps: int, print_interval: int = 100):
        """
        Run the simulation for a specified number of steps.
        
        Args:
            num_steps: Number of steps to simulate
            print_interval: Print status every N steps
        """
        for i in range(num_steps):
            self.step()
            
            if (i + 1) % print_interval == 0:
                days = self.time_elapsed / (24 * 3600)
                print(f"Step {i + 1}/{num_steps} - Time: {days:.2f} days")
    
    def get_total_energy(self) -> float:
        """Calculate total kinetic energy in the system."""
        total_ke = sum(body.get_kinetic_energy() for body in self.bodies)
        return total_ke
    
    def get_center_of_mass(self) -> tuple:
        """Calculate center of mass of the system."""
        total_mass = sum(body.mass for body in self.bodies)
        if total_mass == 0:
            return (0, 0)
        
        com_x = sum(body.mass * body.position[0] for body in self.bodies) / total_mass
        com_y = sum(body.mass * body.position[1] for body in self.bodies) / total_mass
        
        return (com_x, com_y)
    
    def get_status(self) -> str:
        """Return current system status."""
        status = f"\n{'='*60}\n"
        status += f"Simulation Time: {self.time_elapsed / (24*3600):.2f} days\n"
        status += f"Iteration: {self.iteration}\n"
        status += f"Bodies: {len(self.bodies)}\n"
        status += f"Total KE: {self.get_total_energy():.2e} J\n"
        status += f"Center of Mass: {self.get_center_of_mass()}\n"
        status += f"{'='*60}\n"
        
        for body in self.bodies:
            status += body.get_info() + "\n"
        
        return status
    
    def save_trajectory(self, filename: str = "trajectory.txt"):
        """Save trajectories to a file."""
        with open(filename, 'w') as f:
            for body in self.bodies:
                f.write(f"\n{body.name} Trajectory:\n")
                for i, pos in enumerate(body.trajectory):
                    f.write(f"{i},{pos[0]},{pos[1]}\n")
