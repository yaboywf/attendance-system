import cv2
import os
import numpy as np
from imutils.perspective import four_point_transform
from PIL import Image
import io

# Path to the saved image
image_path = 'image.png'  # Replace with your image file path

def scan_detection(image):
    # Start with the whole image as a contour (full image size)
    document_contour = np.array([[0, 0], [image.shape[1], 0], [image.shape[1], image.shape[0]], [0, image.shape[0]]])

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, threshold = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    contours, _ = cv2.findContours(threshold, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)

    max_area = 0
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > 1000:  # Filter out small contours
            peri = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.015 * peri, True)
            if area > max_area and len(approx) == 4:
                document_contour = approx
                max_area = area

    return document_contour

def convert_to_webp(image, output_path, quality=70):
    # Convert the image to WebP format and save it
    img = Image.fromarray(image)
    img.save(output_path, 'WEBP', quality=quality)

def start(image_path):
    image = cv2.imread(image_path)
    frame_copy = image.copy()
    
    # Get the document contour by calling scan_detection
    document_contour = scan_detection(frame_copy)
    
    # Apply perspective transform to straighten the document
    warped = four_point_transform(frame_copy, document_contour.reshape(4, 2))
    
    # Convert the transformed image to WebP format
    webp_path = os.path.splitext(image_path)[0] + ".webp"
    convert_to_webp(warped, webp_path)

# Start the process
start(image_path)
