import os
import shutil
import json

# Define the main folder
main_folder = 'json_import_folder'

# Define the images source folder (where your images are currently located)
images_source_folder = 'source_images'

# Create the main folder if it doesn't exist
if not os.path.exists(main_folder):
    os.makedirs(main_folder)

# Iterate over each image in the source folder
for image_name in os.listdir(images_source_folder):
    # Extract the base name of the image (without extension)
    image_base_name, image_extension = os.path.splitext(image_name)
    
    # Create the subfolder structure
    subfolder_path = os.path.join(main_folder, image_base_name)
    image_folder_path = os.path.join(subfolder_path, '_media')
    
    os.makedirs(image_folder_path, exist_ok=True)
    
    # Copy the image to the _image folder
    source_image_path = os.path.join(images_source_folder, image_name)
    destination_image_path = os.path.join(image_folder_path, image_name)
    shutil.copy2(source_image_path, destination_image_path)
    
    # Create the JSON structure
    json_data = {
        "type": "sfdc_cms__image",
        "title": image_base_name,
        "contentBody": {
            "altText": image_base_name,
            "sfdc_cms:media": {
                "source": {
                    "type": "file",
                    "mimeType": "image/jpg"
                }
            }
        }
    }
    
    # Save the JSON file
    json_file_path = os.path.join(subfolder_path, 'content.json')
    with open(json_file_path, 'w') as json_file:
        json.dump(json_data, json_file, indent=2)

print("Folder structure and JSON files created successfully.")
