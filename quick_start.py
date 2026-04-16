#!/usr/bin/env python
"""
Quick Start Examples for Orbital System

Run this file directly to test different scenarios.
"""

from config import create_preset_scenario
from visualizer import OrbitalVisualizer
import sys


def test_simple_orbit():
    """Test a simple Earth-Moon orbit."""
    print("\n" + "="*60)
    print("TEST 1: Simple Earth-Moon System")
    print("="*60)
    
    system = create_preset_scenario("earth-moon-simple")
    print(f"Initial status:")
    print(system.get_status())
    
    print("\nRunning simulation for 500 steps...")
    system.run(500, print_interval=100)
    
    print("\nFinal status:")
    print(system.get_status())
    
    print("\nDisplaying visualization...")
    viz = OrbitalVisualizer(system)
    viz.show()


def test_sun_earth():
    """Test Sun-Earth orbital system."""
    print("\n" + "="*60)
    print("TEST 2: Sun-Earth System")
    print("="*60)
    
    system = create_preset_scenario("sun-earth")
    print(f"Initial status:")
    print(system.get_status())
    
    print("\nRunning simulation for 365 steps (1 year)...")
    system.run(365, print_interval=50)
    
    print("\nFinal status:")
    print(system.get_status())
    
    print("\nDisplaying visualization...")
    viz = OrbitalVisualizer(system)
    viz.show()


def test_geostationary():
    """Test geostationary satellite orbit."""
    print("\n" + "="*60)
    print("TEST 3: Geostationary Satellite Orbit")
    print("="*60)
    
    system = create_preset_scenario("geostationary-test")
    print(f"Initial status:")
    print(system.get_status())
    
    print("\nRunning simulation for 1000 steps...")
    system.run(1000, print_interval=200)
    
    print("\nFinal status:")
    print(system.get_status())
    
    print("\nDisplaying visualization...")
    viz = OrbitalVisualizer(system)
    viz.show()


def test_escape_velocity():
    """Test escape velocity scenario."""
    print("\n" + "="*60)
    print("TEST 4: Escape Velocity Test")
    print("="*60)
    
    system = create_preset_scenario("escape-test")
    print(f"Initial status:")
    print(system.get_status())
    
    print("\nRunning simulation for 1000 steps...")
    system.run(1000, print_interval=200)
    
    print("\nFinal status:")
    print(system.get_status())
    
    test_object = system.bodies[1]
    final_distance = (test_object.position[0]**2 + test_object.position[1]**2)**0.5
    print(f"\nTest Object final distance: {final_distance:.2e} meters")
    
    print("\nDisplaying visualization...")
    viz = OrbitalVisualizer(system)
    viz.show()


def show_menu():
    """Show available tests."""
    print("\n" + "="*60)
    print("ORBITAL SYSTEM - QUICK START TESTS")
    print("="*60)
    print("\nAvailable tests:")
    print("1. Simple Earth-Moon System")
    print("2. Sun-Earth Orbital System")
    print("3. Geostationary Satellite")
    print("4. Escape Velocity Test")
    print("0. Exit")
    print("\nOr run: python quick_start.py <test_number>")


def main():
    """Main menu."""
    tests = {
        1: test_simple_orbit,
        2: test_sun_earth,
        3: test_geostationary,
        4: test_escape_velocity,
    }
    
    # Check for command-line arguments
    if len(sys.argv) > 1:
        try:
            test_num = int(sys.argv[1])
            if test_num in tests:
                tests[test_num]()
            else:
                print(f"Invalid test number: {test_num}")
                show_menu()
        except ValueError:
            print("Invalid argument. Usage: python quick_start.py <test_number>")
            show_menu()
    else:
        show_menu()
        try:
            choice = input("\nEnter test number (1-4) or 0 to exit: ").strip()
            test_num = int(choice)
            
            if test_num == 0:
                print("Exiting...")
                return
            
            if test_num in tests:
                tests[test_num]()
            else:
                print("Invalid choice!")
        except (ValueError, KeyboardInterrupt):
            print("\nExiting...")


if __name__ == "__main__":
    main()
