import os
import subprocess
import json
from datetime import datetime
import matplotlib.pyplot as plt
import numpy as np

# --- CONFIGURATION ---
# Define the categories for our plots
NUMBERS = ['1', '2', '3']
LETTERS = ['A', 'B', 'C']
IMAGES_DIR = "images"
MANIFEST_FILE = "images.json"

def create_and_save_plots():
    """
    Generates and saves 9 dummy plots and creates a manifest file.
    """
    print("--- Starting plot generation ---")
    
    # This dictionary will map a simple ID (e.g., "1A") to a full filename
    image_manifest = {}
    
    # Get a single timestamp for this entire run
    now = datetime.now()
    timestamp_str = now.strftime('%Y%m%d_%H%M%S')

    # Ensure the images directory exists
    os.makedirs(IMAGES_DIR, exist_ok=True)

    # Loop through each combination to create a plot
    for num in NUMBERS:
        for letter in LETTERS:
            plot_id = f"{num}{letter}"
            
            # --- Create a dummy plot ---
            fig, ax = plt.subplots()
            # Generate some random data for the plot
            x = np.linspace(0, 10, 100)
            y = np.sin(int(num) * x) + np.random.randn(100) * 0.5
            ax.plot(x, y, label=f"Data for {plot_id}")
            
            # Set titles and labels
            title = f"Plot {plot_id} - Generated on\n{now.strftime('%Y-%m-%d %H:%M:%S')}"
            ax.set_title(title)
            ax.set_xlabel("X-axis")
            ax.set_ylabel("Y-axis")
            ax.legend()
            ax.grid(True)
            
            # --- Save the plot ---
            filename = f"plot_{plot_id}_{timestamp_str}.png"
            filepath = os.path.join(IMAGES_DIR, filename)
            plt.savefig(filepath)
            plt.close(fig) # IMPORTANT: Frees up memory after saving
            
            print(f"  > Saved plot: {filepath}")
            
            # Add the entry to our manifest. The key is the simple ID.
            image_manifest[plot_id] = filepath

    # --- Save the manifest file ---
    with open(MANIFEST_FILE, 'w') as f:
        json.dump(image_manifest, f, indent=4)
    print(f"--- Manifest file '{MANIFEST_FILE}' created/updated. ---")


def git_commit_and_push():
    """
    Adds, commits, and pushes the new images and manifest to GitHub.
    """
    print("--- Starting Git push process ---")
    try:
        # Stage all new/changed files in the images directory and the manifest
        subprocess.run(["git", "add", IMAGES_DIR, MANIFEST_FILE], check=True)
        
        # Create a commit message with the current time
        commit_message = f"Automated plot update: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        subprocess.run(["git", "commit", "-m", commit_message], check=True)
        
        # Push the changes to the 'main' branch on 'origin'
        subprocess.run(["git", "push", "origin", "main"], check=True)
        
        print("--- Successfully pushed updates to GitHub. ---")
    except subprocess.CalledProcessError as e:
        print(f"!!! An error occurred during the git process: {e}")
    except FileNotFoundError:
        print("!!! 'git' command not found. Make sure Git is installed and in your system's PATH.")


if __name__ == "__main__":
    create_and_save_plots()
    git_commit_and_push()