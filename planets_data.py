"""
Planetary data and educational content for 3D space exploration
"""

CELESTIAL_DATA = {
    'sun': {
        'name': 'Sun',
        'type': 'Star',
        'mass': 1.989e30,  # kg
        'radius': 6.96e8,  # meters
        'color': 'yellow',
        'facts': [
            '🌟 Type: G-type main-sequence star',
            '📏 Diameter: 1,391,000 km',
            '🌡️ Surface Temp: 5,778 K',
            '💪 Mass: 99.86% of all Solar System mass',
            '⚡ Core Temp: ~15 million K',
            '🔥 Nuclear fusion powers everything'
        ],
        'physics': 'The Sun\'s gravity holds all planets in orbit. Its fusion core produces the energy that sustains all life on Earth.'
    },
    'mercury': {
        'name': 'Mercury',
        'type': 'Terrestrial Planet',
        'mass': 3.285e23,
        'radius': 2.4397e6,
        'orbit_radius': 57.9e9,  # 0.39 AU
        'orbit_speed': 47400,  # m/s
        'color': '#8B7355',
        'facts': [
            '🌍 Type: Terrestrial Planet',
            '📏 Diameter: 4,879 km (38% of Earth)',
            '🌡️ Avg Temp: 167°C',
            '☀️ Distance from Sun: 57.9 million km (0.39 AU)',
            '🔄 Orbital Period: 87.97 days',
            '⚡ Orbital Speed: 47.4 km/s'
        ],
        'physics': 'The smallest and fastest planet. Closest to the Sun with extreme temperature variations between day and night.'
    },
    'venus': {
        'name': 'Venus',
        'type': 'Terrestrial Planet',
        'mass': 4.867e24,
        'radius': 6.0518e6,
        'orbit_radius': 108.2e9,  # 0.72 AU
        'orbit_speed': 35020,
        'color': '#FFC649',
        'facts': [
            '🌍 Type: Terrestrial Planet',
            '📏 Diameter: 12,104 km (95% of Earth)',
            '🌡️ Surface Temp: 464°C (hottest!)',
            '☀️ Distance from Sun: 108.2 million km (0.72 AU)',
            '🔄 Orbital Period: 224.7 days',
            '🔄 Rotates backwards (retrograde)'
        ],
        'physics': 'Similar size to Earth but with runaway greenhouse effect. Spins backwards and very slowly.'
    },
    'earth': {
        'name': 'Earth',
        'type': 'Terrestrial Planet',
        'mass': 5.972e24,
        'radius': 6.371e6,
        'orbit_radius': 149.6e9,  # 1 AU
        'orbit_speed': 29780,
        'color': '#4A90E2',
        'facts': [
            '🌍 Type: Terrestrial Planet',
            '📏 Diameter: 12,742 km',
            '🌡️ Avg Temp: 15°C',
            '☀️ Distance from Sun: 149.6 million km (1 AU)',
            '🔄 Orbital Period: 365.25 days',
            '🌙 Natural Satellites: 1 (Moon)'
        ],
        'physics': 'The only known planet with life. Perfect distance from Sun for liquid water to exist.'
    },
    'moon': {
        'name': 'The Moon',
        'type': 'Natural Satellite',
        'mass': 7.342e22,
        'radius': 1.7374e6,
        'orbit_radius': 384400e3,  # Distance from Earth
        'orbit_speed': 1022,
        'color': '#C0C0C0',
        'facts': [
            '🌙 Type: Natural Satellite',
            '📏 Diameter: 3,474 km (27% of Earth)',
            '🌡️ Temp Range: -173°C to 127°C',
            '🌍 Distance from Earth: 384,400 km',
            '🔄 Orbital Period: 27.3 days',
            '🔒 Tidally Locked: Same side always faces Earth'
        ],
        'physics': 'The Moon\'s gravity causes Earth\'s tides and slowly stabilizes our planet\'s axial tilt.'
    },
    'mars': {
        'name': 'Mars',
        'type': 'Terrestrial Planet',
        'mass': 6.4169e23,
        'radius': 3.3895e6,
        'orbit_radius': 227.9e9,  # 1.52 AU
        'orbit_speed': 24070,
        'color': '#E27B58',
        'facts': [
            '🔴 Type: Terrestrial Planet',
            '📏 Diameter: 6,779 km (53% of Earth)',
            '🌡️ Avg Temp: -63°C',
            '☀️ Distance from Sun: 227.9 million km (1.52 AU)',
            '🔄 Orbital Period: 687 Earth days',
            '🌙 Natural Satellites: 2 (Phobos & Deimos)'
        ],
        'physics': 'Has the largest volcano (Olympus Mons) and deepest canyon (Valles Marineris) in the Solar System.'
    },
    'jupiter': {
        'name': 'Jupiter',
        'type': 'Gas Giant',
        'mass': 1.898e27,
        'radius': 6.9911e7,
        'orbit_radius': 778.5e9,  # 5.2 AU
        'orbit_speed': 13070,
        'color': '#C88B3A',
        'facts': [
            '🪐 Type: Gas Giant',
            '📏 Diameter: 139,820 km (11× Earth)',
            '🌡️ Cloud Temp: -110°C',
            '☀️ Distance from Sun: 778.5 million km (5.2 AU)',
            '🔄 Orbital Period: 11.86 years',
            '🌙 Natural Satellites: 95+ moons'
        ],
        'physics': 'Largest planet in the Solar System. Strong magnetic field and the Great Red Spot storm lasting 300+ years.'
    },
    'saturn': {
        'name': 'Saturn',
        'type': 'Gas Giant',
        'mass': 5.683e26,
        'radius': 5.8232e7,
        'orbit_radius': 1.434e12,  # 9.5 AU
        'orbit_speed': 9680,
        'color': '#FAD5A5',
        'facts': [
            '🪐 Type: Gas Giant',
            '📏 Diameter: 116,460 km (9× Earth)',
            '🌡️ Cloud Temp: -140°C',
            '☀️ Distance from Sun: 1.43 billion km (9.5 AU)',
            '🔄 Orbital Period: 29.5 years',
            '💍 Famous for beautiful ring system'
        ],
        'physics': 'The least dense planet - would float in water! Rings made of ice and rock from tiny to house-sized.'
    },
    'uranus': {
        'name': 'Uranus',
        'type': 'Ice Giant',
        'mass': 8.681e25,
        'radius': 2.5559e7,
        'orbit_radius': 2.871e12,  # 19.2 AU
        'orbit_speed': 6810,
        'color': '#4FD0E7',
        'facts': [
            '🪐 Type: Ice Giant',
            '📏 Diameter: 50,724 km (4× Earth)',
            '🌡️ Atmosphere: -195°C',
            '☀️ Distance from Sun: 2.87 billion km (19.2 AU)',
            '🔄 Orbital Period: 84 years',
            '🌀 Rotates on its side (98° tilt)'
        ],
        'physics': 'Rotates on its side - likely due to ancient collision. One of the windiest planets in the Solar System.'
    },
    'neptune': {
        'name': 'Neptune',
        'type': 'Ice Giant',
        'mass': 1.024e26,
        'radius': 2.4622e7,
        'orbit_radius': 4.495e12,  # 30 AU
        'orbit_speed': 5430,
        'color': '#4166F5',
        'facts': [
            '🪐 Type: Ice Giant',
            '📏 Diameter: 49,244 km (4× Earth)',
            '🌡️ Atmosphere: -200°C (coldest)',
            '☀️ Distance from Sun: 4.5 billion km (30 AU)',
            '🔄 Orbital Period: 165 years',
            '💨 Wind Speeds: Up to 2,100 km/h'
        ],
        'physics': 'The windiest planet and farthest from the Sun. Discovered in 1846 through mathematical prediction!'
    }
}

EDUCATIONAL_CONTENT = [
    {
        'title': '🔬 Orbital Mechanics',
        'text': 'Planets orbit the Sun due to gravity. The closer a planet is to the Sun, the faster it must travel to maintain its orbit.'
    },
    {
        'title': '📐 Kepler\'s Laws',
        'text': 'Planets move in ellipses with the Sun at one focus. A line from planet to Sun sweeps equal areas in equal times.'
    },
    {
        'title': '⚖️ Gravitational Force',
        'text': 'F = G(m₁m₂)/r². Gravity decreases with the square of distance. Double the distance = 1/4 the force.'
    },
    {
        'title': '🎯 Planet Types',
        'text': 'Terrestrial planets (Mercury, Venus, Earth, Mars) are rocky. Gas giants (Jupiter, Saturn) are huge. Ice giants (Uranus, Neptune) are distant and cold.'
    }
]
