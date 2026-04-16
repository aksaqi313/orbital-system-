import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
from orbital_system import OrbitalSystem


class OrbitalVisualizer:
    """Visualizes the orbital system."""
    
    def __init__(self, system: OrbitalSystem, figsize=(12, 10)):
        """
        Initialize the visualizer.
        
        Args:
            system: The orbital system to visualize
            figsize: Figure size (width, height) in inches
        """
        self.system = system
        self.fig, self.ax = plt.subplots(figsize=figsize)
        self.setup_plot()
    
    def setup_plot(self):
        """Setup the plot appearance."""
        self.ax.set_aspect('equal')
        self.ax.grid(True, alpha=0.3)
        self.ax.set_xlabel('X Position (meters)')
        self.ax.set_ylabel('Y Position (meters)')
        self.ax.set_title('Orbital System Simulation')
    
    def update_plot(self):
        """Update the plot with current system state."""
        self.ax.clear()
        self.setup_plot()
        
        # Plot bodies
        for body in self.system.bodies:
            # Plot current position
            self.ax.plot(body.position[0], body.position[1], 'o', 
                        color=body.color, markersize=10, label=body.name)
            
            # Plot trajectory
            if len(body.trajectory) > 1:
                trajectory = np.array(body.trajectory)
                self.ax.plot(trajectory[:, 0], trajectory[:, 1], 
                           color=body.color, alpha=0.3, linewidth=0.5)
        
        # Plot center of mass
        com = self.system.get_center_of_mass()
        self.ax.plot(com[0], com[1], 'x', color='red', markersize=15, 
                    label='Center of Mass', linewidth=2)
        
        # Set limits with some padding
        all_positions = []
        for body in self.system.bodies:
            all_positions.extend(body.trajectory)
        
        if all_positions:
            all_positions = np.array(all_positions)
            margin = 0.1
            x_range = all_positions[:, 0].max() - all_positions[:, 0].min()
            y_range = all_positions[:, 1].max() - all_positions[:, 1].min()
            
            self.ax.set_xlim(all_positions[:, 0].min() - x_range * margin,
                            all_positions[:, 0].max() + x_range * margin)
            self.ax.set_ylim(all_positions[:, 1].min() - y_range * margin,
                            all_positions[:, 1].max() + y_range * margin)
        
        # Add legend and info
        self.ax.legend(loc='upper right')
        info_text = (f"Time: {self.system.time_elapsed / (24*3600):.2f} days | "
                    f"Iteration: {self.system.iteration}")
        self.ax.text(0.02, 0.98, info_text, transform=self.ax.transAxes,
                    verticalalignment='top', bbox=dict(boxstyle='round', 
                    facecolor='wheat', alpha=0.5))
        
        self.fig.tight_layout()
    
    def show(self):
        """Display the plot."""
        self.update_plot()
        plt.show()
    
    def save(self, filename: str):
        """Save the plot to a file."""
        self.update_plot()
        plt.savefig(filename, dpi=150, bbox_inches='tight')
        print(f"Plot saved to {filename}")


def create_animation(system: OrbitalSystem, num_frames: int, 
                     save_images: bool = False, image_dir: str = "frames"):
    """
    Create an animation by running the simulation and showing frames.
    
    Args:
        system: The orbital system
        num_frames: Number of frames to generate
        save_images: Whether to save individual frames
        image_dir: Directory to save frames in
    """
    visualizer = OrbitalVisualizer(system)
    
    if save_images:
        import os
        os.makedirs(image_dir, exist_ok=True)
    
    for frame in range(num_frames):
        visualizer.update_plot()
        
        if save_images:
            filename = f"{image_dir}/frame_{frame:04d}.png"
            plt.savefig(filename, dpi=100, bbox_inches='tight')
        
        plt.pause(0.01)
        system.step()
        
        if (frame + 1) % 10 == 0:
            print(f"Frame {frame + 1}/{num_frames}")
    
    plt.close()
