"""
3D Space Exploration Application
Interactive 3D visualization of the Solar System with physics simulation
"""

import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import numpy as np
import math
import sys
from body import CelestialBody
from orbital_system import OrbitalSystem
from planets_data import CELESTIAL_DATA, EDUCATIONAL_CONTENT
from config import AU, SUN_MASS, EARTH_MASS, MOON_MASS


class SolarSystem3DExplorer:
    """Interactive 3D Solar System explorer with educational content."""
    
    def __init__(self):
        """Initialize the 3D Solar System explorer."""
        self.system = OrbitalSystem()
        self.bodies_data = {}
        self.selected_body = None
        self.paused = False
        self.speed_multiplier = 1.0
        self.show_orbits = True
        self.show_labels = True
        self.edu_page = 0
        
        self.fig = plt.figure(figsize=(16, 12))
        self.ax = self.fig.add_subplot(111, projection='3d')
        
        self.setup_ui()
        self.setup_solar_system()
    
    def setup_ui(self):
        """Setup matplotlib UI elements."""
        self.fig.suptitle('🌌 3D Solar System Explorer', fontsize=16, fontweight='bold')
        
        # Create info text area
        self.info_ax = plt.axes([0.02, 0.02, 0.3, 0.35])
        self.info_ax.axis('off')
        self.info_text = self.info_ax.text(0.05, 0.95, '', transform=self.info_ax.transAxes,
                                          fontfamily='monospace', fontsize=8, verticalalignment='top',
                                          bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))
        
        # Create education panel
        self.edu_ax = plt.axes([0.68, 0.02, 0.3, 0.25])
        self.edu_ax.axis('off')
        self.edu_text = self.edu_ax.text(0.05, 0.95, '', transform=self.edu_ax.transAxes,
                                        fontfamily='monospace', fontsize=8, verticalalignment='top',
                                        bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.8))
        
        # Create controls panel
        self.control_ax = plt.axes([0.68, 0.30, 0.3, 0.18])
        self.control_ax.axis('off')
        self.control_text = self.control_ax.text(0.05, 0.95, '', transform=self.control_ax.transAxes,
                                                fontfamily='monospace', fontsize=9, verticalalignment='top',
                                                bbox=dict(boxstyle='round', facecolor='lightgreen', alpha=0.8))
        
        # Connect keyboard/mouse events
        self.fig.canvas.mpl_connect('key_press_event', self.on_key_press)
        self.fig.canvas.mpl_connect('pick_event', self.on_pick)
        
        self.update_education_display()
        self.update_control_display()
    
    def setup_solar_system(self):
        """Setup the Solar System with planets."""
        # Sun
        sun = CelestialBody(
            name='Sun',
            mass=SUN_MASS,
            position=(0, 0, 0),
            velocity=(0, 0, 0),
            radius=6.96e8,
            color='yellow'
        )
        self.system.add_body(sun)
        self.bodies_data['Sun'] = {'body': sun, 'color': 'yellow'}
        
        # Mercury
        mercury = CelestialBody(
            name='Mercury',
            mass=3.285e23,
            position=(57.9e9, 0, 0),
            velocity=(0, 47400, 0),
            radius=2.4397e6,
            color='gray'
        )
        self.system.add_body(mercury)
        self.bodies_data['Mercury'] = {'body': mercury, 'color': 'gray'}
        
        # Venus
        venus = CelestialBody(
            name='Venus',
            mass=4.867e24,
            position=(108.2e9, 0, 0),
            velocity=(0, 35020, 0),
            radius=6.0518e6,
            color='orange'
        )
        self.system.add_body(venus)
        self.bodies_data['Venus'] = {'body': venus, 'color': 'orange'}
        
        # Earth
        earth = CelestialBody(
            name='Earth',
            mass=EARTH_MASS,
            position=(149.6e9, 0, 0),
            velocity=(0, 29780, 0),
            radius=6.371e6,
            color='blue'
        )
        self.system.add_body(earth)
        self.bodies_data['Earth'] = {'body': earth, 'color': 'blue'}
        self.earth = earth
        
        # Moon (orbits Earth)
        moon = CelestialBody(
            name='Moon',
            mass=MOON_MASS,
            position=(149.6e9 + 384400e3, 0, 0),
            velocity=(0, 29780 + 1022, 0),
            radius=1.7374e6,
            color='lightgray'
        )
        self.system.add_body(moon)
        self.bodies_data['Moon'] = {'body': moon, 'color': 'lightgray'}
        
        # Mars
        mars = CelestialBody(
            name='Mars',
            mass=6.4169e23,
            position=(227.9e9, 0, 0),
            velocity=(0, 24070, 0),
            radius=3.3895e6,
            color='red'
        )
        self.system.add_body(mars)
        self.bodies_data['Mars'] = {'body': mars, 'color': 'red'}
        
        # Jupiter
        jupiter = CelestialBody(
            name='Jupiter',
            mass=1.898e27,
            position=(778.5e9, 0, 0),
            velocity=(0, 13070, 0),
            radius=6.9911e7,
            color='brown'
        )
        self.system.add_body(jupiter)
        self.bodies_data['Jupiter'] = {'body': jupiter, 'color': 'brown'}
        
        # Saturn
        saturn = CelestialBody(
            name='Saturn',
            mass=5.683e26,
            position=(1.434e12, 0, 0),
            velocity=(0, 9680, 0),
            radius=5.8232e7,
            color='tan'
        )
        self.system.add_body(saturn)
        self.bodies_data['Saturn'] = {'body': saturn, 'color': 'tan'}
    
    def update_plot(self):
        """Update the 3D visualization."""
        self.ax.clear()
        self.ax.set_xlabel('X (meters)')
        self.ax.set_ylabel('Y (meters)')
        self.ax.set_zlabel('Z (meters)')
        self.ax.set_title('3D Solar System (Time: %.2f days)' % 
                         (self.system.time_elapsed / (24 * 3600)))
        
        # Plot all bodies and their trajectories
        for body_name, data in self.bodies_data.items():
            body = data['body']
            
            # Plot trajectory
            if len(body.trajectory) > 1:
                traj = np.array(body.trajectory)
                self.ax.plot(traj[:, 0], traj[:, 1], traj[:, 2],
                           color=data['color'], alpha=0.3, linewidth=0.5, label=f"{body_name} path")
            
            # Plot current position
            self.ax.scatter(body.position[0], body.position[1], body.position[2],
                          color=data['color'], s=100, picker=True, label=body_name)
            
            # Add label
            if self.show_labels:
                self.ax.text(body.position[0], body.position[1], body.position[2],
                           f"  {body_name}", fontsize=8)
        
        # Set equal aspect ratio
        all_positions = []
        for data in self.bodies_data.values():
            all_positions.extend(data['body'].trajectory)
        
        if all_positions:
            all_positions = np.array(all_positions)
            x_min, x_max = all_positions[:, 0].min(), all_positions[:, 0].max()
            y_min, y_max = all_positions[:, 1].min(), all_positions[:, 1].max()
            z_min, z_max = all_positions[:, 2].min(), all_positions[:, 2].max()
            
            max_range = max(x_max - x_min, y_max - y_min, z_max - z_min) / 2
            mid_x = (x_max + x_min) * 0.5
            mid_y = (y_max + y_min) * 0.5
            mid_z = (z_max + z_min) * 0.5
            
            self.ax.set_xlim(mid_x - max_range, mid_x + max_range)
            self.ax.set_ylim(mid_y - max_range, mid_y + max_range)
            self.ax.set_zlim(mid_z - max_range, mid_z + max_range)
        
        plt.tight_layout()
    
    def on_key_press(self, event):
        """Handle keyboard events."""
        if event.key == ' ':  # Space to pause/play
            self.paused = not self.paused
            status = "PAUSED" if self.paused else "RUNNING"
            print(f"Simulation {status}")
        
        elif event.key == 'up':  # Speed up
            self.speed_multiplier = min(self.speed_multiplier * 2, 16)
            print(f"Speed: {self.speed_multiplier}x")
        
        elif event.key == 'down':  # Speed down
            self.speed_multiplier = max(self.speed_multiplier / 2, 0.25)
            print(f"Speed: {self.speed_multiplier}x")
        
        elif event.key == 'r':  # Reset view
            self.ax.view_init(elev=20, azim=45)
        
        elif event.key == 'o':  # Toggle orbits
            self.show_orbits = not self.show_orbits
            print(f"Orbits: {'ON' if self.show_orbits else 'OFF'}")
        
        elif event.key == 'l':  # Toggle labels
            self.show_labels = not self.show_labels
            print(f"Labels: {'ON' if self.show_labels else 'OFF'}")
        
        elif event.key == 'n':  # Next education page
            self.edu_page = (self.edu_page + 1) % len(EDUCATIONAL_CONTENT)
            self.update_education_display()
        
        elif event.key == 'p':  # Previous education page
            self.edu_page = (self.edu_page - 1) % len(EDUCATIONAL_CONTENT)
            self.update_education_display()
        
        elif event.key == 'q':  # Quit
            plt.close(self.fig)
    
    def on_pick(self, event):
        """Handle planet selection."""
        if event.artist:
            artist = event.artist
            # Get the picked artist's position (would need custom picking)
            print("Planet clicked")
    
    def update_education_display(self):
        """Update education content display."""
        content = EDUCATIONAL_CONTENT[self.edu_page]
        edu_text = f"{content['title']}\n\n{content['text']}\n\n[Page {self.edu_page + 1}/{len(EDUCATIONAL_CONTENT)}]\n\nPress N/P for next/prev"
        self.edu_text.set_text(edu_text)
    
    def update_control_display(self):
        """Update control display."""
        status = "PAUSED" if self.paused else "RUNNING"
        controls = f"CONTROLS:\n\n" \
                  f"[SPACE] Play/Pause: {status}\n" \
                  f"[UP/DOWN] Speed: {self.speed_multiplier}x\n" \
                  f"[O] Toggle Orbits: {'ON' if self.show_orbits else 'OFF'}\n" \
                  f"[L] Toggle Labels: {'ON' if self.show_labels else 'OFF'}\n" \
                  f"[N/P] Education Page\n" \
                  f"[R] Reset View\n" \
                  f"[Q] Quit\n" \
                  f"\nDrag to rotate view\n" \
                  f"Scroll to zoom"
        self.control_text.set_text(controls)
    
    def update_info_display(self, body_name):
        """Update info panel with body details."""
        if body_name in CELESTIAL_DATA:
            data = CELESTIAL_DATA[body_name]
            info = f"{'='*35}\n{data['name'].upper()}\n{'='*35}\n\n" \
                  f"Type: {data['type']}\n\n" \
                  f"FACTS:\n" + "\n".join(data['facts']) + f"\n\nPHYSICS:\n{data['physics']}"
            self.info_text.set_text(info)
    
    def run(self, num_steps=1000):
        """Run the simulation with interactive visualization."""
        print("Starting 3D Solar System Explorer...")
        print("Controls: SPACE=pause, UP/DOWN=speed, O=orbits, L=labels, N/P=education, R=reset, Q=quit")
        
        for step in range(num_steps):
            if not self.paused:
                # Advance simulation based on speed multiplier
                for _ in range(int(self.speed_multiplier)):
                    self.system.step()
            
            # Update plot every 10 steps
            if step % 10 == 0:
                self.update_plot()
                self.update_control_display()
                plt.pause(0.01)
            
            if step % 100 == 0:
                print(f"Step {step}/{num_steps} - Time: {self.system.time_elapsed / (24*3600):.2f} days")


def main():
    """Main entry point."""
    print("🌌 3D Solar System Explorer")
    print("=" * 50)
    
    explorer = SolarSystem3DExplorer()
    
    # Show for 2000 steps (interactive window will stay open)
    plt.show()


if __name__ == '__main__':
    main()
