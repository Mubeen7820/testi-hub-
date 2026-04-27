from PIL import Image, ImageDraw
import os

def remove_background_floodfill(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # Create a mask for the background
    # We'll use floodfill from all four corners to be safe
    # We use a tolerance (threshold) to handle compression artifacts
    
    # We'll try to detect the background colors first
    # Checkerboard is usually white (255,255,255) and light grey (204,204,204)
    bg_colors = [(255, 255, 255), (204, 204, 204), (203, 203, 203), (205, 205, 205)]
    
    data = img.load()
    
    # Target colors to remove
    def is_bg(r, g, b):
        # If it's very bright (white)
        if r > 200 and g > 200 and b > 200 and abs(r-g) < 10 and abs(g-b) < 10:
            return True
        # If it's the specific grey
        if 190 < r < 220 and 190 < g < 220 and 190 < b < 220 and abs(r-g) < 10 and abs(g-b) < 10:
            return True
        return False

    for y in range(height):
        for x in range(width):
            r, g, b, a = data[x, y]
            if is_bg(r, g, b):
                data[x, y] = (255, 255, 255, 0)
            else:
                # Keep original color
                pass

    img.save(output_path, "PNG")
    print(f"Saved flood-fill transparent logo to {output_path}")

if __name__ == "__main__":
    base_dir = r"c:\Users\Sahithi\Downloads\testimonial-automation-tool-main-main\testimonial-automation-tool-main-main"
    input_file = os.path.join(base_dir, "src", "assets", "logo.png")
    output_file = os.path.join(base_dir, "src", "assets", "logo_transparent.png")
    remove_background_floodfill(input_file, output_file)
