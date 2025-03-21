import face_recognition
import sys

def recognize_faces(reference_image_path, captured_image_path):
    ref_image = face_recognition.load_image_file(reference_image_path)
    captured_image = face_recognition.load_image_file(captured_image_path)

    ref_encoding = face_recognition.face_encodings(ref_image)
    captured_encoding = face_recognition.face_encodings(captured_image)

    if len(ref_encoding) == 0 or len(captured_encoding) == 0:
        print("Error: No face detected in one of the images.")
        return

    match = face_recognition.compare_faces([ref_encoding[0]], captured_encoding[0])
    print("Match" if match[0] else "No Match")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python face_recognition_script.py <reference_image> <captured_image>")
    else:
        recognize_faces(sys.argv[1], sys.argv[2])