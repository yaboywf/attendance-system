import cv2
import face_recognition
import numpy as np

def face_recognition(reference_image_path, captured_image_path):
    ref_image = face_recognition.load_image_file(reference_image_path)
    captured_image = face_recognition.load_image_file(captured_image_path)
    
    ref_encoding = face_recognition.face_encodings(ref_image)
    captured_encoding = face_recognition.face_encodings(captured_image)
    
    if len(ref_encoding) == 0 or len(captured_encoding) == 0:
        print("Error: No face detected in one of the images.")
        return False
    
    match = face_recognition.compare_faces([ref_encoding[0]], captured_encoding[0])
    return match[0]