#!/usr/bin/env python3
"""
Generate a beautiful landscape visualization representing the LLM architecture.
This creates a stylized, artistic representation of transformer layers as a landscape.
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Circle, Rectangle
from matplotlib.colors import LinearSegmentedColormap
import matplotlib.patheffects as path_effects

# Set random seed for reproducibility
np.random.seed(42)

# Create custom colormap
def create_gradient_cmap(name, colors):
    """Create a custom colormap from a list of colors."""
    return LinearSegmentedColormap.from_list(name, colors)

# Define color schemes
sky_colors = ['#0a1628', '#1a3a5c', '#2d5a87', '#4a7fb5', '#7fb3d5', '#b8d4e8']
layer_colors = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#5f27cd', '#ff9ff3']

def draw_layer_as_mountain(ax, x_center, width, height, color, layer_name, layer_num):
    """Draw a transformer layer as a stylized mountain/layer."""
    # Create mountain-like shape
    n_points = 100
    x = np.linspace(x_center - width/2, x_center + width/2, n_points)
    
    # Create irregular mountain shape
    base_height = height
    noise = np.sin(x * np.pi * 2 / width) * 0.15 + np.random.normal(0, 0.05, n_points)
    noise = np.convolve(noise, np.ones(5)/5, mode='same')  # Smooth
    
    y = base_height * (1 - np.abs((x - x_center) / (width/2))**0.8) + noise * base_height
    y = np.maximum(y, 0)
    
    # Draw filled area
    ax.fill_between(x, 0, y, color=color, alpha=0.7, edgecolor='white', linewidth=2)
    
    # Add highlight on top
    highlight_y = y * 0.95
    ax.plot(x, highlight_y, color='white', alpha=0.3, linewidth=3)
    
    # Add layer name and number
    text = ax.text(x_center, height * 0.5, f'{layer_name}\\nLayer {layer_num}', 
                   ha='center', va='center', fontsize=10, fontweight='bold',
                   color='white')
    text.set_path_effects([path_effects.withStroke(linewidth=3, foreground='black')])
    
    return y.max()

def draw_attention_heads(ax, x, y, n_heads=8):
    """Draw attention heads as glowing orbs."""
    colors = plt.cm.viridis(np.linspace(0, 1, n_heads))
    angles = np.linspace(0, 2*np.pi, n_heads, endpoint=False)
    radius = 0.8
    
    for i, (angle, color) in enumerate(zip(angles, colors)):
        hx = x + radius * np.cos(angle)
        hy = y + radius * np.sin(angle)
        
        # Glow effect
        for r, alpha in [(0.3, 0.3), (0.2, 0.5), (0.1, 0.8)]:
            circle = Circle((hx, hy), r, color=color, alpha=alpha)
            ax.add_patch(circle)
        
        # Core
        circle = Circle((hx, hy), 0.08, color='white', alpha=0.9)
        ax.add_patch(circle)

def generate_landscape():
    """Generate the complete landscape visualization."""
    fig = plt.figure(figsize=(24, 14))
    ax = fig.add_subplot(111)
    ax.set_xlim(0, 24)
    ax.set_ylim(0, 14)
    ax.axis('off')
    
    # Create gradient sky background
    gradient = np.linspace(0, 1, 256).reshape(256, -1)
    gradient = np.vstack((gradient, gradient))
    ax.imshow(gradient, extent=[0, 24, 0, 14], aspect='auto', 
             cmap=create_gradient_cmap('sky', sky_colors), alpha=0.8)
    
    # Add stars/neurons in the sky
    np.random.seed(42)
    for _ in range(100):
        x, y = np.random.uniform(0, 24), np.random.uniform(8, 13.5)
        size = np.random.uniform(2, 8)
        alpha = np.random.uniform(0.3, 0.8)
        ax.scatter(x, y, s=size, c='white', alpha=alpha, marker='*')
    
    # Title
    title_text = ax.text(12, 13, 'Transformer Architecture Landscape', 
                         fontsize=32, fontweight='bold', ha='center', color='white')
    title_text.set_path_effects([path_effects.withStroke(linewidth=4, foreground='navy')])
    
    subtitle = ax.text(12, 12.2, 'A Journey Through Layers of Understanding', 
                      fontsize=16, ha='center', color='white', style='italic')
    subtitle.set_path_effects([path_effects.withStroke(linewidth=2, foreground='navy')])
    
    # Draw transformer layers as mountains
    layers = [
        ('Self-Attention', 0),
        ('Self-Attention', 1),
        ('Self-Attention', 2),
        ('Cross-Attention', 3),
        ('FFN', 4),
        ('Output', 5)
    ]
    
    x_positions = np.linspace(3, 21, len(layers))
    max_height = 0
    
    for i, ((layer_name, layer_num), x) in enumerate(zip(layers, x_positions)):
        height = 3.5 + np.random.uniform(-0.3, 0.3)
        max_height = max(max_height, height)
        
        color = layer_colors[i % len(layer_colors)]
        draw_layer_as_mountain(ax, x, 3.5, height, color, layer_name, layer_num)
        
        # Draw attention heads above layer
        if 'Attention' in layer_name:
            draw_attention_heads(ax, x, height + 0.5, n_heads=8)
    
    # Add connecting lines between layers
    for i in range(len(x_positions) - 1):
        x1, x2 = x_positions[i], x_positions[i + 1]
        y = 0.8
        # Draw flow arrow
        ax.annotate('', xy=(x2 - 1.8, y), xytext=(x1 + 1.8, y),
                   arrowprops=dict(arrowstyle='->', lw=2, color='white', alpha=0.6))
    
    # Add legend for layers
    legend_elements = [mpatches.Patch(color=color, label=f'Layer {i}') 
                      for i, color in enumerate(layer_colors[:len(layers)])]
    ax.legend(handles=legend_elements, loc='lower right', fontsize=10, 
             framealpha=0.8, title='Layer Types')
    
    # Footer
    footer = ax.text(12, 0.3, 'Generated by LLM-Primer Visualization Engine | © 2026', 
                    fontsize=10, ha='center', color='white', alpha=0.7)
    
    plt.tight_layout()
    return fig

# Generate the landscape
print("🎨 Generating landscape visualization...")
fig = generate_landscape()
plt.savefig('/Users/albert/CodeProjects/LLM-primer/public/llm-landscape.png', dpi=300, bbox_inches='tight', 
            facecolor='auto', edgecolor='none')
plt.savefig('/Users/albert/CodeProjects/LLM-primer/public/llm-landscape.svg', format='svg', bbox_inches='tight')
print("✅ Landscape saved to public/llm-landscape.png and .svg")
plt.show()